// -------------------------------------------------------------------
// <copyright file="PartnerServiceBuildoutWorkflowTests.cs" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -------------------------------------------------------------------

namespace Internal.Exchange.Datacenter.CosmicManagement.Workflows.Test
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using FluentAssertions;
    using Microsoft.Azure.Deployment.Common.Express.Models;
    using Microsoft.Azure.Storage;
    using Microsoft.Office.Datacenter.AzureManagement.Common.Execution;
    using Microsoft.Office.Datacenter.AzureManagement.Common.Logging;
    using Microsoft.Office.Datacenter.AzureManagement.Common.Tests;
    using Microsoft.Office.Datacenter.AzureManagement.Core.Types;
    using Microsoft.Office.Datacenter.CentralAdmin.Interop;
    using Microsoft.Office.Datacenter.CentralAdmin.Workflow.TestFramework;
    using Microsoft.Office.Datacenter.CosmicManagement.Shared.Constants;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflow.Ev2;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.BuildOut;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.BuildOut.Factories;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.BuildOut.Providers;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.BuildOut.RegionAgnosticBuildout;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.BuildOut.RegionSpecificBuildout.Models;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.BuildOut.ServiceBuildout;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.Ev2.Models;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.Exceptions;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.SubWorkflowExecution;
    using Microsoft.Office.Datacenter.CosmicManagement.Workflows.ValidationFramework;
    using Microsoft.Office.Substrate.Cosmic.Platform.BuildoutStatusInventory;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using Moq;
    using BuildoutStatus = Microsoft.Azure.Deployment.Common.Express.Models.BuildoutStatus;
    using ExpressModels = Microsoft.Azure.Deployment.Common.Express.Models;

    [TestClass]
    public class PartnerServiceBuildoutWorkflowTests
    {
        private Mock<IExecutionLogger> logger;
        private IRetryStrategyFactory retryStrategyFactory;
        private ServiceBuildoutParameters parameters;
        private ServiceBuildoutProcessor processor;
        private Dictionary<string, WorkflowArgument> eV2ArtifactsParameters;
        private Mock<ILateBindingWorkflowExecutor> lateBindingWorkflowExecutor;
        private Mock<IEV2ParameterExtractionProviderFactory> ev2ParameterExtractionProviderFactory;
        private Mock<IEV2ParameterExtractionProvider> ev2ParameterExtractionProvider;
        private Mock<IInventoryProviderFactory> inventoryProviderFactory;
        private Mock<IInventoryProvider> inventoryProvider;
        private Mock<IExpressV2DeploymentManagerFactory> expressV2DeploymentManagerFactory;
        private Mock<IExpressV2DeploymentManager> expressV2DeploymentManager;
        private Mock<IValidationFrameworkProviderFactory> validationFrameworkProviderFactory;
        private Mock<IBocBackendProviderFactory> bocBackendProviderFactory;
        private Mock<ICbasProviderFactory> cbasProviderFactory;
        private Mock<IValidationFrameworkProvider> validationFrameworkProvider;
        private Mock<IBocBackendProvider> bocBackendProvider;
        private Mock<ICbasProvider> cbasProvider;
        private IRAConfigReaderProviderFactory configReaderProviderFactory;
        private ExpressModels.Buildout buildoutParameterMock;
        private Ev2Rollout rollout;
        private RegionSpecificArtifactDetailsGetResponse regionSpecificArtifactDetails;

        private const string buildoutId = "12342523515543526416";
        private const string rolloutId = "12342523515543526416";
        private const string serviceTreeId = "4d59e7e3-6fda-493b-bab1-b101c8530965";
        private const string deploymentPackageId = "Microsoft.Random.ServiceGroup";
        private const string updatedBy = "CABO";
        private const string ring = "test";
        private const string region = "westus";
        private const string ibvRequestId = "12323424235235235235353553";
        private const string incidentId = "2342323";
        private const string buildoutLink = "https://buildoutlink";
        private const string rolloutLink = "https://ev2portal.azure.net/#/Rollout/Microsoft.Random.ServiceGroup/12342523515543526416?RolloutInfra=test";
        public const string StatusStarted = "Started";
        public string AdditionalDetails = null;
        public string AttempStatus = BuildoutAttemptStatus.NotYetFailed.ToString();
        private const string serviceGroupName = "Microsoft.Random.ServiceGroupName";

        /// <summary>
        /// Mock dependencies
        /// </summary>
        [TestInitialize]
        public void TestStarts()
        {
            this.logger = new Mock<IExecutionLogger>();
            Mock<IRetryStrategyFactory> mockRetryStrategyFactory = new Mock<IRetryStrategyFactory>();
            mockRetryStrategyFactory.Setup(r => r.Create(It.IsAny<RetriableOperationType>())).Returns(new DoNotRetry());
            this.retryStrategyFactory = mockRetryStrategyFactory.Object;

            Mock<IExecuteWorkflowRequest<string>> executeWorkflowRequest = new Mock<IExecuteWorkflowRequest<string>>();
            executeWorkflowRequest.Setup(r => r.Result).Returns(WorkflowResult.Succeeded);

            this.lateBindingWorkflowExecutor = new Mock<ILateBindingWorkflowExecutor>();
            this.lateBindingWorkflowExecutor.Setup(r => r.BeginSubworkflowByNameAsync<string>(
                It.IsAny<ComponentQualifiedTypeName>(),
                It.IsAny<Dictionary<string, WorkflowArgument>>(),
                It.IsAny<WorkflowUserContext>(),
                It.IsAny<TimeSpan>()
                )
            ).Returns(() => Task.FromResult(executeWorkflowRequest.Object));

            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "TorusTeamName", "torusTeamName" },
                { "SourceImageDigest", "sourceImageDigest" },
                { "ReleaseID", "123" },
            };
            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus()
            };

            this.inventoryProvider = new Mock<IInventoryProvider>();
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.inventoryProvider.Setup(r => r.GetCurrentRolloutSpecIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )
            ).Returns(() => Task.FromResult(Constants.FirstRolloutSpecRelativePathIndex));

            var rolloutSpecIndexContract = new RolloutSpecIndexContract
            {
                ServiceTreeid = serviceTreeId,
                DeploymentPackageId = deploymentPackageId,
                Region = region,
                RolloutSpecIndex = Constants.FirstRolloutSpecRelativePathIndex
            };

            var response = new RolloutSpecIndexResponse
            {
                StatusCode = 200,
                Message = "Success",
                RolloutSpecIndex = rolloutSpecIndexContract,
            };

            this.inventoryProvider.Setup(r => r.UpdateCurrentRolloutSpecIndexAsync(
                serviceTreeId, deploymentPackageId, region, 
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()))
                .ReturnsAsync(response);

            this.inventoryProviderFactory = new Mock<IInventoryProviderFactory>();
            this.inventoryProviderFactory.Setup(r => r.CreateInventoryProvider(
                It.IsAny<AzureCloud>()
                )
            ).Returns(this.inventoryProvider.Object);

            this.rollout = new Ev2Rollout
            {
                RolloutId = "123",
                Status = Ev2RolloutStatus.Succeeded
            };

            this.expressV2DeploymentManager = new Mock<IExpressV2DeploymentManager>();

            this.expressV2DeploymentManager.Setup(r => r.GetRolloutAsync(
                 It.IsAny<String>(),
                 It.IsAny<String>())
             ).Returns(() => Task.FromResult(rollout));

            var services = new List<ServiceBuildout>();

            services.Add(new ServiceBuildout()
            {
                RolloutId = rolloutId,
                RolloutLink = rolloutLink,
                BuildoutLink = buildoutLink,
                ServiceBuildoutId = buildoutId,
                ServiceBuildoutStatus = "Failed",
                ServiceGroup = deploymentPackageId,
                ServiceIdentifier = serviceTreeId
            });

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = buildoutId,
                Status = BuildoutStatus.Succeeded,
                Services = services
            };

            this.expressV2DeploymentManager.Setup(r => r.GetBuildoutStatusAsync(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>())
             ).Returns(() => Task.FromResult(buildoutParameterMock));

            var mockEv2Rollout = new Ev2Rollout
            {
                RolloutId = buildoutId,
                Status = (Ev2RolloutStatus)RolloutStatus.Failed,
                RolloutDetails = new Ev2RolloutDetails
                {
                    Environment = "test",
                    ServiceGroup = serviceGroupName
                }
            };

            this.expressV2DeploymentManager.Setup(r => r.GetRolloutAsync(
                It.IsAny<String>(),
                It.IsAny<String>())).Returns(() => Task.FromResult(mockEv2Rollout));

            this.expressV2DeploymentManagerFactory = new Mock<IExpressV2DeploymentManagerFactory>();
            this.expressV2DeploymentManagerFactory.Setup(r => r.CreateAsync(
                It.IsAny<ServicePrincipal>(),
                It.IsAny<bool>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                "",
                "",
                "",
                It.IsAny<AuthenticationInfo>()
                )
            ).Returns(() => Task.FromResult(this.expressV2DeploymentManager.Object));

            this.validationFrameworkProvider = new Mock<IValidationFrameworkProvider>();

            this.validationFrameworkProvider.Setup(r => r.ValidateServiceAsync(
               It.IsAny<String>(),
               It.IsAny<String>(),
               It.IsAny<String>(),
               It.IsAny<ValidationKind>(),
               It.IsAny<AzureCloud>()
               )).ReturnsAsync("ibvRequestId");

            this.validationFrameworkProviderFactory = new Mock<IValidationFrameworkProviderFactory>();
            this.validationFrameworkProviderFactory.Setup(r => r.CreateValidationFrameworkProvider(
                It.IsAny<AzureCloud>()
                )
            ).Returns(this.validationFrameworkProvider.Object);

            this.configReaderProviderFactory = new RAConfigReaderProviderFactory();

            this.bocBackendProviderFactory = new Mock<IBocBackendProviderFactory>();
            this.bocBackendProvider = new Mock<IBocBackendProvider>();

            var rolloutSpecDetails = new RolloutSpecDetails
            {
                RolloutSpecPath = "RolloutSpec1.json",
                Ring = ring,
                Namespace = "namespace",
                CatalogHash = "catalogHash",
                BuildVersion = "version",
            };

            var rolloutSpecDetails2 = new RolloutSpecDetails
            {
                RolloutSpecPath = "RolloutSpec2.json",
                Ring = "Ring2",
                Namespace = "namespace2",
                CatalogHash = "catalogHash2",
                BuildVersion = "version2",
            };

            this.regionSpecificArtifactDetails = new RegionSpecificArtifactDetailsGetResponse
            {
                ServiceTreeId = serviceTreeId,
                DeploymentPackageId = deploymentPackageId,
                ServiceGroupName = serviceGroupName,
                RolloutSpecRelativePath = "RolloutSpec1.json;RolloutSpec2.json",
                Region = region,
                ServiceGroupRoot = "ServiceGroupRoot",
                ArtifactPath = "ArtifactPath",
                RolloutDetails = new List<RolloutSpecDetails> { rolloutSpecDetails, rolloutSpecDetails2 }
            };

            var updateRolloutIndexResponse = new RegionSpecificRolloutSpecUpdationResponse
            {
                ServiceTreeId = serviceTreeId,
                DeploymentPackageId = deploymentPackageId,
                Region = region,
                AzureCloudName = AzureCloud.Public.ToString()
            };

            this.bocBackendProvider.Setup(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region)).ReturnsAsync(Constants.FirstRolloutSpecRelativePathIndex);
            this.bocBackendProvider.Setup(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region)).ReturnsAsync(this.regionSpecificArtifactDetails);

            this.bocBackendProvider.Setup(
                x => x.UpdateCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()))
                .ReturnsAsync(updateRolloutIndexResponse);

            this.bocBackendProviderFactory.Setup(x => x.CreateBocBackendProvider(It.IsAny<AzureCloud>())).Returns(this.bocBackendProvider.Object);

            this.cbasProviderFactory = new Mock<ICbasProviderFactory>();
            this.cbasProvider = new Mock<ICbasProvider>();

            this.cbasProvider.Setup(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region)).ReturnsAsync(this.regionSpecificArtifactDetails);
            this.cbasProviderFactory.Setup(x => x.CreateCbasProvider(It.IsAny<AzureCloud>())).Returns(this.cbasProvider.Object);

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            this.parameters = new ServiceBuildoutParameters
            {
                DeploymentPackageId = deploymentPackageId,
                Region = region,
                ServiceName = "RandomService",
                ServiceTreeId = new Guid(serviceTreeId),
                ServiceType = Constants.CosmicNonSubstrateServiceType,
                UseEv2Test = false
            };
        }

        [TestMethod]
        public void TestConstructor()
        {
            ConstructorTestExtensions.RunFullConstructorVerificationTest<ServiceBuildoutProcessor>();
        }

        [TestMethod]
        public void DeploymentPackageIdIsNull()
        {
            //Arrange
            this.parameters.DeploymentPackageId = null;

            //Act
            Func<Task> func = () => this.processor.ExecuteNextAsync(this.parameters, new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            });

            //Assert
            func.Should().Throw<ArgumentException>().And.Message.Should().Contain("cannot be null");
        }

        [TestMethod]
        public void RegionIsNull()
        {
            //Arrange
            this.parameters.Region = null;

            //Act
            Func<Task> func = () => this.processor.ExecuteNextAsync(this.parameters, new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            });

            //Assert
            func.Should().Throw<ArgumentException>().And.Message.Should().Contain("cannot be null");
        }

        [TestMethod]
        public void ServiceTreeIdIsEmpty()
        {
            //Arrange
            this.parameters.ServiceTreeId = Guid.Empty;

            //Act
            Func<Task> func = () => this.processor.ExecuteNextAsync(this.parameters, new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            });

            //Assert
            func.Should().Throw<ArgumentException>().And.Message.Should().Contain("ServiceTreeId must not be Guid.Empty");
        }

        [TestMethod]
        public void ServiceNameIsNull()
        {
            //Arrange
            this.parameters.ServiceName = null;

            //Act
            Func<Task> func = () => this.processor.ExecuteNextAsync(this.parameters, new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            });

            //Assert
            func.Should().Throw<ArgumentException>().And.Message.Should().Contain("cannot be null");
        }

        [TestMethod]
        public void ServiceTypeIsNull()
        {
            //Arrange
            this.parameters.ServiceType = null;

            //Act
            Func<Task> func = () => this.processor.ExecuteNextAsync(this.parameters, new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            });

            //Assert
            func.Should().Throw<ArgumentException>().And.Message.Should().Contain("cannot be null");
        }

        [TestMethod]
        public void ServiceTypeIsInvalid()
        {
            //Arrange
            this.parameters.ServiceType = "random";

            //Act
            Func<Task> func = () => this.processor.ExecuteNextAsync(this.parameters, new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            });

            //Assert
            func.Should().Throw<ArgumentException>().And.Message.Should().Contain("Invalid serviceType");
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public async Task WhenAzureCloudUSSec_ThenThrowsException()
        {
            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "RaptorX"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.AzureCloud, AzureCloud.USSec);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public async Task WhenAzureCloudUSNat_ThenThrowsException()
        {
            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory, 
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "EagleX"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.AzureCloud, AzureCloud.USNat);
        }

        [TestMethod]
        public async Task AzureCloudGallatinTest()
        {
            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory, 
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "GALLATIN"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            Assert.AreEqual(state.AzureCloud, AzureCloud.Gallatin);
        }

        [TestMethod]
        public async Task AzureCloudSovbaseTest()
        {
            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            Assert.AreEqual(state.AzureCloud, AzureCloud.Sovbase);
            Assert.IsTrue(state.UseEv2Test);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_IsBuildoutStatusFailedOnce_ThenThrowsException()
        {
            var additionalDetails = "Test Exception from CosmicRADeploymentWorkflow";
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "1234",
                    retryStage: BuildoutAttemptStatus.FailedOnce.ToString(),
                    additionalDetails: additionalDetails)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            Func<Task> action = async () =>await this.processor.ExecuteNextAsync(this.parameters, state);

            var exceptionMsg = $"Buildout process is blocked due to the following error(s) faced at/post Ev2 trigger. " +
                $"Currently the attempt status is: {BuildoutAttemptStatus.FailedOnce.ToString()} and the exception detail is: {additionalDetails}. " +
                $"Please refer to the exception message and take appropriate actions or reach the boc team for any further assistance. " +
                $"Reference docs:\n For RS: https://eng.ms/docs/products/m365-buildout-standardization/corebuildout/automatedrstrigger/automatedrstriggerintro \nFor RA: https://eng.ms/docs/products/m365-buildout-standardization/servicereadiness/cosmicraartifacts/cosmicraartifacts ";

            action.Should().Throw<Exception>().And.Message.Should().Contain(exceptionMsg);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_IsBuildoutStatusFailedTwice_ThenThrowsException()
        {
            var additionalDetails = "Test Exception from CosmicRADeploymentWorkflow";
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "1234",
                    retryStage: BuildoutAttemptStatus.FailedOnce.ToString(),
                    additionalDetails: additionalDetails)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            Func<Task> action = async () => await this.processor.ExecuteNextAsync(this.parameters, state);

            var exceptionMsg = $"Buildout process is blocked due to the following error(s) faced at/post Ev2 trigger. " +
                $"Currently the attempt status is: {BuildoutAttemptStatus.FailedTwice.ToString()} and the exception detail is: {additionalDetails}. " +
                $"Please refer to the exception message and take appropriate actions or reach the boc team for any further assistance. " +
                $"Reference docs:\n For RS: https://eng.ms/docs/products/m365-buildout-standardization/corebuildout/automatedrstrigger/automatedrstriggerintro \nFor RA: https://eng.ms/docs/products/m365-buildout-standardization/servicereadiness/cosmicraartifacts/cosmicraartifacts ";

            action.Should().Throw<Exception>().And.Message.Should().Contain(exceptionMsg);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_IsIBVAlreadyTriggeredReturnsTrue_ThenTransitionCheckValidationStatusStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "1234")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.IBVRequestId, "1234");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchBuildoutStatusFromInventory_IsIBVAlreadyTriggeredReturnsTrue_ThenTransitionCheckValidationStatusStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "1234")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.IBVRequestId, "1234");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_BuildoutStatusIsRunning_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Running",
                    ibvRequestId: "1234")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
            Assert.AreEqual(state.IBVRequestId, "1234");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchBuildoutStatusFromInventory_BuildoutStatusIsRunning_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Running",
                    ibvRequestId: "1234")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
            Assert.AreEqual(state.IBVRequestId, "1234");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_IBVRequestIdNotAvailable_IsIBVAlreadyTriggeredReturnsTrue_ThenTransitionCheckValidationStatusStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "NotAvailable")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.IBVRequestId, "NotAvailable");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchBuildoutStatusFromInventory_IBVRequestIdNotAvailable_IsIBVAlreadyTriggeredReturnsTrue_ThenTransitionCheckValidationStatusStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "NotAvailable")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.IBVRequestId, "NotAvailable");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_BuildoutStatusIsNull_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };
            state.CurrentStep = ServiceBuildoutStep.GetInventoryStatus;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            state.BuildoutStatus = null;

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.IsNull(state.BuildoutStatus);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }


        [TestMethod]
        public async Task WhenSovbaseCloud_FetchBuildoutStatusFromInventory_BuildoutStatusIsNull_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "SOVBASE"
            };
            state.CurrentStep = ServiceBuildoutStep.GetInventoryStatus;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            state.BuildoutStatus = null;

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.IsNull(state.BuildoutStatus);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_BuildoutStatusIsEmpty_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };
            state.CurrentStep = ServiceBuildoutStep.GetInventoryStatus;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            state.BuildoutStatus = string.Empty;

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, string.Empty);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchBuildoutStatusFromInventory_BuildoutStatusIsEmpty_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };
            state.CurrentStep = ServiceBuildoutStep.GetInventoryStatus;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            state.BuildoutStatus = string.Empty;

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, string.Empty);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }

        [TestMethod]
        public async Task FetchBuildoutStatusFromInventory_ReceivesNullStatusFromInventory_IsIBVAlreadyTriggeredReturnsFalse_ThenTransitionFetchParametersStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.IsNull(state.BuildoutStatus);
            Assert.IsNull(state.IBVRequestId);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);
        }

        [TestMethod]
        [ExpectedException(typeof(InventoryProviderException))]
        public async Task InventoryNullTest()
        {
            this.inventoryProviderFactory = new Mock<IInventoryProviderFactory>();

            this.inventoryProviderFactory.Setup(r => r.CreateInventoryProvider(
                It.IsAny<AzureCloud>()
                )
            ).Returns(() => null);

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory, 
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);
        }

        [TestMethod]
        [ExpectedException(typeof(InventoryProviderException))]
        public async Task InventoryNullTestForSovbaseCloud()
        {
            this.inventoryProviderFactory = new Mock<IInventoryProviderFactory>();

            this.inventoryProviderFactory.Setup(r => r.CreateInventoryProvider(
                AzureCloud.Sovbase
                )
            ).Returns(() => null);

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);
        }

        [TestMethod]
        public async Task NoEntryInInventoryTest()
        {
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult<BuildoutStatusResponse>(null));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            Assert.AreEqual(state.Result.Status, "Pending");
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_NoEntryInInventoryTest_ThenReturnPendingStatus()
        {
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult<BuildoutStatusResponse>(null));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory, 
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            Assert.AreEqual(state.Result.Status, "Pending");
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_SucceededStatusInInventory_IBVFlagNotFound_ThenTransitionMarkActionAsIBVStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.MarkActionAsIBV);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.IBV.ToString());

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");

            this.VerifyLog(LogLevel.Informational, "IBV flag value not found in the extracted parameters, using default value true for IBV tests execution.", Times.Once());
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_SucceededStatusInInventory_IBVFlagIsTrue_ThenTransitionMarkActionAsIBVStep()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "IBV", true },
            };

            this.bocBackendProvider.Setup(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region))
                .Returns(Task.FromResult("2"));

            this.bocBackendProviderFactory.Setup(x => x.CreateBocBackendProvider(AzureCloud.Public))
                .Returns(this.bocBackendProvider.Object);

            this.inventoryProvider.Setup(r => r.GetCurrentRolloutSpecIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )
            ).Returns(() => Task.FromResult("2"));

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.MarkActionAsIBV);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.IBV.ToString());

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");

            this.VerifyLog(LogLevel.Verbose, $"Found parameter from extracted artifacts with key: IBV has value: True", Times.Once());
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_SucceededStatusInInventory_IBVFlagIsFalse_ThenWorkflowCompletes()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "IBV", false },
            };

            this.inventoryProvider.Setup(r => r.GetCurrentRolloutSpecIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )
            ).Returns(() => Task.FromResult("2"));

            this.bocBackendProvider.Setup(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region))
                .Returns(Task.FromResult("2"));

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            this.VerifyLog(LogLevel.Verbose, $"Found parameter from extracted artifacts with key: IBV has value: False", Times.Once());
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateBuildoutStatus_SucceededStatusInInventory_IBVFlagNotFound_ThenTransitionMarkActionAsIBVStep()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.MarkActionAsIBV);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.IBV.ToString());

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");

            this.VerifyLog(LogLevel.Informational, "IBV flag value not found in the extracted parameters, using default value true for IBV tests execution.", Times.Once());
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateBuildoutStatus_SucceededStatusInInventory_IBVFlagIsTrue_ThenTransitionMarkActionAsIBVStep()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "IBV", true },
            };

            this.bocBackendProvider.Setup(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region))
                .Returns(Task.FromResult("2"));

            this.bocBackendProviderFactory.Setup(x => x.CreateBocBackendProvider(AzureCloud.Public))
                .Returns(this.bocBackendProvider.Object);

            this.inventoryProvider.Setup(r => r.GetCurrentRolloutSpecIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )
            ).Returns(() => Task.FromResult("2"));

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.MarkActionAsIBV);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.IBV.ToString());

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);
            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");

            this.VerifyLog(LogLevel.Verbose, $"Found parameter from extracted artifacts with key: IBV has value: True", Times.Once());
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateBuildoutStatus_SucceededStatusInInventory_IBVFlagIsFalse_ThenWorkflowCompletes()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "IBV", false },
            };

            this.bocBackendProvider.Setup(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region))
                .Returns(Task.FromResult("2"));

            this.bocBackendProviderFactory.Setup(x => x.CreateBocBackendProvider(AzureCloud.Public))
                .Returns(this.bocBackendProvider.Object);

            this.inventoryProvider.Setup(r => r.GetCurrentRolloutSpecIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )
            ).Returns(() => Task.FromResult("2"));

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            this.VerifyLog(LogLevel.Verbose, $"Found parameter from extracted artifacts with key: IBV has value: False", Times.Once());
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_FailedStatusInInventory_ThenWorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Failed")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateBuildoutStatus_FailedStatusInInventory_ThenWorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Failed")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.BuildoutStatus, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_RunningStatusInInventory_RunningStatusFromEv2_WorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                Status = BuildoutStatus.Running
            };

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateBuildoutStatus_RunningStatusInInventory_RunningStatusFromEv2_WorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                Status = BuildoutStatus.Running
            };

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_RunningStatusInInventory_FailedStatusFromEv2_WorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                Status = BuildoutStatus.Failed
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchAndUpdateBuildoutStatus_RunningStatusInInventory_EmptyBuildoutResponse_WorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.buildoutParameterMock = null;
            this.expressV2DeploymentManager.Setup(r => r.GetBuildoutStatusAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>())
                ).ReturnsAsync(this.buildoutParameterMock);

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateBuildoutStatus_RunningStatusInInventory_FailedStatusFromEv2_WorkflowCompletes()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                Status = BuildoutStatus.Failed
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_ActionIsIBV_ReceivedRequestIdAsNotAvailable_ThenFetchIBVStatus()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "NotAvailable")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_ActionIsIBV_ReceivedRequestIdAsNotAvailable_ThenFetchIBVStatus()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: "NotAvailable")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ValidIbvRequestId_NullResultInResponse_ThenPopulateRequiredMessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "Validation Framework result received in response is null or empty." +
                " It can be either of true, false, or N/A. ";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ValidIbvRequestId_NullResultInResponse_ThenPopulateRequiredMessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "Validation Framework result received in response is null or empty." +
                " It can be either of true, false, or N/A. ";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_EmptyResultInResponse_ThenPopulatemessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = string.Empty,
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "Validation Framework result received in response is null or empty." +
                " It can be either of true, false, or N/A. ";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_EmptyResultInResponse_ThenPopulatemessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = string.Empty,
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "Validation Framework result received in response is null or empty." +
                " It can be either of true, false, or N/A. ";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_IBVTestsFailAndReceivesNullIcmId_ThenPopulatemessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "false",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "IBV tests failed, but Validation Framework failed to send the required IcmId for tests failure, a retrigger is required.";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_IBVTestsFailAndReceivesNullIcmId_ThenPopulatemessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "false",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "IBV tests failed, but Validation Framework failed to send the required IcmId for tests failure, a retrigger is required.";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_InvalidIcmId_ThenPopulatemessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "true",
                IcmId = "123@#",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "Validation Framework Response Icm Id cannot be long int. ";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_InvalidIcmId_ThenPopulatemessage()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "true",
                IcmId = "123@#",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            var message = "Validation Framework Response Icm Id cannot be long int. ";

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.AreEqual(state.Result.Message, message);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_IncompletedState_ThenUpdateIBVDetailsToOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "N/A",
                IcmId = "123456",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_IncompletedState_ThenUpdateIBVDetailsToOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "N/A",
                IcmId = "123456",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Running));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_CompletedAndFailedState_ThenUpdateIBVDetailsToOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "false",
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.IsNotNull(state.Result.IncidentID);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_CompletedAndFailedState_ThenUpdateIBVDetailsToOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "false",
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.IsNotNull(state.Result.IncidentID);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_CompletedAndSucceededState_ThenUpdateIBVDetailsToOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "true",
                IcmId = "123456",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_CompletedAndSucceededState_ThenUpdateIBVDetailsToOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "true",
                IcmId = "123456",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Succeeded));
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_InvalidResult_ThenUpdateWorkflowOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "missing",
                IcmId = "123456",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_FetchAndUpdateIBVStatus_StatusSucceeded_ReceivesIbvRequestId_InvalidResult_ThenUpdateWorkflowOutput()
        {
            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "missing",
                IcmId = "123456",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                AzureCloud.Sovbase,
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, buildoutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));
        }

        [TestMethod]
        public async Task AlreadyExistingStatusInInventoryFlowTest()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Canceled")
            };
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(RolloutStatus), RolloutStatus.Canceled));
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_AlreadyCancelledStatusExistingInInventory_ThenReturnCancelled()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Canceled")
            };
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(RolloutStatus), RolloutStatus.Canceled));
        }

        [TestMethod]
        public async Task AlreadyExistingRunningStatusInInventoryFlowTest()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");
        }

        [TestMethod]
        public async Task WhenSovbaseCloud_ThenValidateAlreadyExistingRunningStatusInInventoryFlowTest()
        {
            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };
            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            Assert.AreEqual(state.Result.Status, "BuildoutSucceeded");
        }

        [TestMethod]
        public async Task MockServiceSuccessTestWorkflow()
        {
            //Arrange
            this.parameters.ServiceTreeId = ServiceBuildoutConstants.MockSuccessfulServiceTreeIDs[0];

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            Assert.AreEqual(state.Result.Status, CosmicManagementConstants.StatusSucceededIBVNotTriggered);
        }

        [TestMethod]
        public async Task TriggerBuildoutCosmicFlowWithWorkflowVersion()
        {
            var services = new List<ExpressModels.ServiceBuildout>();

            services.Add(new ExpressModels.ServiceBuildout()
            {
                RolloutId = "123",
                RolloutLink = "https://rolloutlink",
                ServiceBuildoutId = "456",
                ServiceBuildoutStatus = "None",
                BuildoutLink = "https://buildoutlink",
                ServiceGroup = "testServiceGroup",
                ServiceIdentifier = "testServiceIdentifier"
            });

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                //Mocked at None so that the Buildout Ready flow is checked,
                //since for running and failure wf completes and no status is available as Started
                Status = BuildoutStatus.None,
                Services = services
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD",
                WorkflowVersion = "1.1.1.1"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            this.expressV2DeploymentManager.Verify(a => a.GetRolloutAsync(
                 It.IsAny<String>(),
                 It.IsAny<String>()), Times.Never);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.BuildoutReady);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.TriggerBuildout);

            state.SubWorkflowName.Should().Be("CosmicRegionAgnosticWorkflow");

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, "None");
            Assert.AreEqual(state.ExtractedParameters[nameof(state.ForceEv2Rollout)], false);
        }

        [TestMethod]
        public async Task TriggerBuildoutCosmicFlowWithWorkflowVersion_ForSovbaseCloud()
        {
            var services = new List<ExpressModels.ServiceBuildout>();

            services.Add(new ExpressModels.ServiceBuildout()
            {
                RolloutId = "123",
                RolloutLink = "https://rolloutlink",
                ServiceBuildoutId = "456",
                ServiceBuildoutStatus = "None",
                BuildoutLink = "https://buildoutlink",
                ServiceGroup = "testServiceGroup",
                ServiceIdentifier = "testServiceIdentifier"
            });

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                //Mocked at None so that the Buildout Ready flow is checked,
                //since for running and failure wf completes and no status is available as Started
                Status = BuildoutStatus.None,
                Services = services
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE",
                WorkflowVersion = "1.1.1.1"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            this.expressV2DeploymentManager.Verify(a => a.GetRolloutAsync(
                 It.IsAny<String>(),
                 It.IsAny<String>()), Times.Never);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.BuildoutReady);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.TriggerBuildout);

            state.SubWorkflowName.Should().Be("CosmicRegionAgnosticWorkflow");

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, "None");
            Assert.AreEqual(state.ExtractedParameters[nameof(state.ForceEv2Rollout)], false);
        }

        [TestMethod]
        public async Task TriggerBuildoutWithForceEv2RolloutTrue_GriffinFlow_UnableToGenerateRolloutLink_ThenThrowsException()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Version", "version" },
                { "TorusTeamName", "torusTeamName" },
                { "ReleaseID", "123" },
            };

            this.rollout = new Ev2Rollout
            {
                RolloutId = "123",
                Status = Ev2RolloutStatus.None,
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD",
                ForceEv2Rollout = true
            };
            this.parameters.ForceEv2Rollout = true;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);
        }

        [TestMethod]
        public void TestWorkflow()
        {
            TestDependencyContainer container = new TestDependencyContainer();

            PartnerServiceBuildoutWorkflow workflow = new PartnerServiceBuildoutWorkflow
            {
                ServiceTreeId = new Guid("3A5CCB5F-5790-4B7A-A247-955DD88973CD"),
                ServiceName = "random",
                DeploymentPackageId = "Group",
                ServiceType = "ModelD",
                Region = "eastus"
            };
            var result = WorkflowTester.TestWorkflow(workflow, TimeSpan.FromMinutes(1), container);

            Assert.AreEqual(result, WorkflowResult.Failed);
        }

        private Microsoft.Office.Substrate.Cosmic.Platform.BuildoutStatusInventory.BuildoutStatus GetBuildoutStatus(
            string status = "Started",
            bool serviceReadiness = true,
            string incidentId = incidentId,
            string ibvRequestId = ibvRequestId,
            string retryStage = "NotYetFailed",
            string additionalDetails = null)
        {
            var instance = new Microsoft.Office.Substrate.Cosmic.Platform.BuildoutStatusInventory.BuildoutStatus
            {
                BuildoutId = buildoutId,
                ServiceTreeid = serviceTreeId,
                ServiceGroup = deploymentPackageId,
                ServiceReadiness = serviceReadiness,
                Ev2BuildoutStatus = status,
                Ring = ring,
                Region = region,
                UpdatedBy = updatedBy,
                VFIncidentId = incidentId,
                IBVRequestID = ibvRequestId,
                RetryStage = retryStage,
                AdditionalDetails = additionalDetails,
            };
            return instance;
        }

        [TestMethod]
        public async Task TriggerBuildoutCosmicFlowWithoutWorkflowVersion()
        {
            var services = new List<ExpressModels.ServiceBuildout>();

            services.Add(new ExpressModels.ServiceBuildout()
            {
                RolloutId = "123",
                RolloutLink = "https://rolloutlink",
                ServiceBuildoutId = "456",
                ServiceBuildoutStatus = "None",
                BuildoutLink = "https://buildoutlink",
                ServiceGroup = "testServiceGroup",
                ServiceIdentifier = "testServiceIdentifier"
            });

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                Status = BuildoutStatus.None,
                Services = services
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };
            this.parameters.ForceEv2Rollout = false;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            this.expressV2DeploymentManager.Verify(a => a.GetRolloutAsync(
                 It.IsAny<String>(),
                 It.IsAny<String>()), Times.Never);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.BuildoutReady);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.TriggerBuildout);

            state.SubWorkflowName.Should().Be("CosmicRegionAgnosticWorkflow");

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, "None");

            Assert.AreEqual(state.ExtractedParameters[nameof(state.ForceEv2Rollout)], false);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.BUILDOUT.ToString());
        }

        [TestMethod]
        public async Task TriggerBuildoutCosmicFlowWithoutWorkflowVersion_ForSovbaseCloud()
        {
            var services = new List<ExpressModels.ServiceBuildout>();

            services.Add(new ExpressModels.ServiceBuildout()
            {
                RolloutId = "123",
                RolloutLink = "https://rolloutlink",
                ServiceBuildoutId = "456",
                ServiceBuildoutStatus = "None",
                BuildoutLink = "https://buildoutlink",
                ServiceGroup = "testServiceGroup",
                ServiceIdentifier = "testServiceIdentifier"
            });

            this.buildoutParameterMock = new ExpressModels.Buildout
            {
                BuildoutId = "123",
                Status = BuildoutStatus.None,
                Services = services
            };

            this.processor = new ServiceBuildoutProcessor(
                this.logger.Object,
                this.inventoryProviderFactory.Object,
                this.expressV2DeploymentManagerFactory.Object,
                this.lateBindingWorkflowExecutor.Object,
                this.ev2ParameterExtractionProviderFactory.Object,
                this.validationFrameworkProviderFactory.Object,
                this.configReaderProviderFactory,
                this.bocBackendProviderFactory.Object,
                this.cbasProviderFactory.Object);

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "SOVBASE"
            };
            this.parameters.ForceEv2Rollout = false;

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            this.expressV2DeploymentManager.Verify(a => a.GetRolloutAsync(
                 It.IsAny<String>(),
                 It.IsAny<String>()), Times.Never);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.BuildoutReady);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.TriggerBuildout);

            state.SubWorkflowName.Should().Be("CosmicRegionAgnosticWorkflow");

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.Result.Status, "None");

            Assert.AreEqual(state.ExtractedParameters[nameof(state.ForceEv2Rollout)], false);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.BUILDOUT.ToString());
        }

        [TestMethod]
        public async Task WhenFetchParametersFromArtifacts_WhenRegionSpecificRollout_ThenAssignsCorrectAction()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "ServiceGroupName", serviceGroupName }
            };

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);
            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);
            state.IsRegionSpecificRollout.Should().BeTrue();
            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.REGION_SPECIFIC_ROLLOUT.ToString());
        }

        [TestMethod]
        public async Task WhenFetchParametersFromArtifacts_WhenRegionSpecificRollout_WhenNullCosmicParams_ThenAssignNA()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> 
            {
                { "IsRegionSpecificRollout", true },
                { "DeploymentRing", string.Empty },
                { "Namespace", string.Empty },
                { "DeploymentVersion", string.Empty },
                { "CatalogHash", string.Empty },
                { "ServiceGroupName", serviceGroupName }
            };

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            ServiceBuildoutState state = new ServiceBuildoutState
            {

                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);
            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);
            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);
            state.IsRegionSpecificRollout.Should().BeTrue();

            await this.processor.ExecuteNextAsync(this.parameters, state);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);
            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.REGION_SPECIFIC_ROLLOUT.ToString());
            Assert.AreEqual(state.ExtractedParameters["IsRegionSpecificRollout"], true);
            Assert.AreEqual(state.ExtractedParameters["DeploymentRing"], Constants.NotApplicableValue);
            Assert.AreEqual(state.ExtractedParameters["Namespace"], Constants.NotApplicableValue);
            Assert.AreEqual(state.ExtractedParameters["DeploymentVersion"], Constants.NotApplicableValue);
            Assert.AreEqual(state.ExtractedParameters["CatalogHash"], Constants.NotApplicableValue);
        }

        [TestMethod]
        public async Task FetchAndUpdateRSRolloutStatus_RunningStatusInInventory_WhenFailedStatusFromEv2_ThenWorksAsExpected()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "ring2" },
                { "Namespace", "namespace2" },
                { "DeploymentVersion", "version2" },
                { "CatalogHash", "catalogHash2" },
                { "IsRegionSpecificRollout", true },
                { "ServiceGroupName", serviceGroupName }
            };

            this.bocBackendProvider.Setup(r => r.GetCurrentRolloutSpecPathIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )).Returns(() => Task.FromResult("1")); 

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.ExtractedParameters["DeploymentRing"] = "ring2";
            state.ExtractedParameters["Namespace"] = "namespace2";
            state.DeploymentRing = "ring2";

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            state.IsRegionSpecificRollout.Should().BeTrue();
            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.REGION_SPECIFIC_ROLLOUT.ToString());
            Assert.AreEqual(state.Result.Status, "Failed");
            Assert.AreEqual(state.DeploymentRing, "test");

            this.inventoryProvider.Verify(
                x => x.CreateBuildoutStatus(deploymentPackageId, serviceTreeId, "test", region, It.IsAny<string>(), "Started", true),
                Times.Once());

            this.bocBackendProviderFactory.Verify(x => x.CreateBocBackendProvider(AzureCloud.Public), Times.Once());  
            this.bocBackendProvider.Verify(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region), Times.Never());
            this.bocBackendProvider.Verify(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region), Times.Never());
            this.bocBackendProvider
                .Verify(x => x.UpdateCurrentRolloutSpecPathIndexAsync(
                serviceTreeId, deploymentPackageId, region, Constants.FirstRolloutSpecRelativePathIndex, null, true), Times.Never());
        }

        [TestMethod]
        public async Task FetchAndUpdateRSRolloutStatus_RunningStatusInInventory_WhenRunningStatusFromEv2_ThenWorkflowCompletes()
        {
            var ev2rollout = new Ev2Rollout
            {
                RolloutId = "123",
                Status = (Ev2RolloutStatus)RolloutStatus.Running,
                RolloutDetails = new Ev2RolloutDetails
                {
                    Environment = "test"
                }
            };

            this.expressV2DeploymentManager.Setup(r => r.GetRolloutAsync(
                It.IsAny<String>(),
                It.IsAny<String>())).Returns(() => Task.FromResult(ev2rollout));

            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "ServiceGroupName", serviceGroupName }
            };
            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Running")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            state.IsRegionSpecificRollout.Should().BeTrue();
            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.REGION_SPECIFIC_ROLLOUT.ToString());
            Assert.AreEqual(state.Result.Status, "Running");
        }

        [TestMethod]
        public async Task WhenFetchParametersFromArtifacts_WhenRegionSpecificRollout_WhenRolloutStatusIsSucceeded_WhenRolloutSpecsLeft_ThenWorksAsExpected()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "ServiceGroupName", serviceGroupName }
            };

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            var buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.BuildoutReady);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.TriggerBuildout);

            state.SubWorkflowName.Should().Be("CosmicRegionAgnosticWorkflow");

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.REGION_SPECIFIC_ROLLOUT.ToString());
            Assert.AreEqual(state.ExtractedParameters["DeploymentRing"], "Ring2");
            Assert.AreEqual(state.ExtractedParameters["Namespace"], "namespace2");
            Assert.AreEqual(state.ExtractedParameters["DeploymentVersion"], "version2");
            Assert.AreEqual(state.ExtractedParameters["CatalogHash"], "catalogHash2");
            Assert.AreEqual(state.ExtractedParameters["IsRegionSpecificRollout"], true);

            Assert.AreEqual(state.BuildoutStatus, state.Result.Status, CosmicManagementConstants.RolloutSpecsNotFinished);

            this.bocBackendProviderFactory.Verify(x => x.CreateBocBackendProvider(AzureCloud.Public), Times.Once());
            this.bocBackendProvider.Verify(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region), Times.Never);
            this.bocBackendProvider.Verify(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region), Times.Never);
            this.bocBackendProvider
                .Verify(x => x.UpdateCurrentRolloutSpecPathIndexAsync(
                serviceTreeId, deploymentPackageId, region, Constants.FirstRolloutSpecRelativePathIndex, this.regionSpecificArtifactDetails.RolloutSpecRelativePath, It.IsAny<bool>()),
                Times.Never);
        }

        [TestMethod]
        public async Task WhenFetchParametersFromArtifacts_WhenRegionSpecificRollout_WhenRolloutStatusIsSucceeded_WhenRolloutSpecFinished_ThenWorksAsExpected()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "ServiceGroupName", serviceGroupName }
            };

            this.bocBackendProvider.Setup(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region))
                .Returns(Task.FromResult("2"));

            this.bocBackendProviderFactory.Setup(x => x.CreateBocBackendProvider(AzureCloud.Public))
                .Returns(this.bocBackendProvider.Object);

            this.inventoryProvider.Setup(r => r.GetCurrentRolloutSpecIndexAsync(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>()
                )
            ).Returns(() => Task.FromResult("2"));

            this.ev2ParameterExtractionProviderFactory = new Mock<IEV2ParameterExtractionProviderFactory>();
            this.ev2ParameterExtractionProvider = new Mock<IEV2ParameterExtractionProvider>();

            this.ev2ParameterExtractionProvider.Setup(r => r.GetParametersfromArtifacts(
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<String>(),
                It.IsAny<bool>(),
                null
                )
            ).Returns(() => Task.FromResult(this.eV2ArtifactsParameters));

            this.ev2ParameterExtractionProviderFactory.Setup(f => f.CreateEv2ParameterExtractionProvider(It.IsAny<AzureCloud>()))
                .Returns(this.ev2ParameterExtractionProvider.Object);

            var buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus(
                    status: "Succeeded",
                    ibvRequestId: string.Empty)
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.FetchStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckSuccessStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckIBVFlag);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.MarkActionAsIBV);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            Assert.AreEqual(state.ExtractedParameters["Action"], CosmicRADeploymentAction.IBV.ToString());

            Assert.AreEqual(state.Result.Status, CosmicManagementConstants.StatusSucceededIBVNotTriggered);

            this.bocBackendProviderFactory.Verify(x => x.CreateBocBackendProvider(AzureCloud.Public), Times.Once());
            this.bocBackendProvider.Verify(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region), Times.Never);
            this.bocBackendProvider.Verify(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region), Times.Never);
            this.bocBackendProvider
                .Verify(x => x.UpdateCurrentRolloutSpecPathIndexAsync(
                serviceTreeId, deploymentPackageId, region, Constants.FirstRolloutSpecRelativePathIndex, this.regionSpecificArtifactDetails.RolloutSpecRelativePath, It.IsAny<bool>()),
                Times.Never);

            Assert.AreEqual(state.ExtractedParameters["CatalogHash"], "catalogHash");  
        }

        [TestMethod]
        public async Task FetchAndUpdateIBVStatus_WhenRegionSpecificTrigger_CompletedAndFailedState_ThenResetSpecIndexAndUpdateIBVDetailsToOutput()
        {
            this.eV2ArtifactsParameters = new Dictionary<string, WorkflowArgument> {
                { "DeploymentRing", "test" },
                { "Namespace", "namespace" },
                { "DeploymentVersion", "version" },
                { "CatalogHash", "catalogHash" },
                { "IsRegionSpecificRollout", true },
                { "ServiceGroupName", serviceGroupName }
            };

            var validationStateResponse = new ValidationStateResponse
            {
                Status = ValidationFrameworkGetApiResponseStatus.Queued,
                Result = "false",
                IcmId = "123",
                Details = new List<ValidationTaskDetail>
                {
                    new ValidationTaskDetail
                    {
                        TestCaseId = "123",
                        TestCaseName = "Test",
                        State = "Queued",
                        DiagnosticBlob = "https://test.com"
                    }
                },
                IsIBV = true
            };

            this.validationFrameworkProvider.Setup(r => r.GetTestRegistrationStatusAsync(
                It.IsAny<String>(),
                It.IsAny<AzureCloud>(),
                It.IsAny<string>(),
                It.IsAny<string>()
                )).ReturnsAsync(validationStateResponse);

            BuildoutStatusResponse buildoutStatusResponse = new BuildoutStatusResponse
            {
                Message = "Success",
                StatusCode = 200,
                BuildoutStatus = this.GetBuildoutStatus("Succeeded")
            };

            this.inventoryProvider.Setup(r => r.GetBuildoutStatus(
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>(),
                 It.IsAny<String>()
                 )
             ).Returns(() => Task.FromResult(buildoutStatusResponse));

            ServiceBuildoutState state = new ServiceBuildoutState
            {
                CAServiceName = "PROD"
            };

            state.CurrentStep.Should().Be(ServiceBuildoutStep.NotStarted);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Intitialized);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.ExtractParameters);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.GetInventoryStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.CheckValidationStatus);

            await this.processor.ExecuteNextAsync(this.parameters, state);

            state.CurrentStep.Should().Be(ServiceBuildoutStep.Done);

            Assert.AreEqual(state.BuildoutLink, rolloutLink);
            Assert.IsNotNull(state.Result.BuildoutResponseData);
            Assert.IsNotNull(state.Result.IncidentID);
            Assert.AreEqual(state.Result.Status, Enum.GetName(typeof(BuildoutStatus), BuildoutStatus.Failed));

            this.inventoryProvider.Verify(
                x => x.CreateBuildoutStatus(deploymentPackageId, serviceTreeId, "test", region, It.IsAny<string>(), "Started", true),
                Times.Once());
            this.bocBackendProviderFactory.Verify(x => x.CreateBocBackendProvider(AzureCloud.Public), Times.Once());
            this.bocBackendProvider.Verify(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region), Times.Never);
            this.bocBackendProvider.Verify(x => x.GetCurrentRolloutSpecPathIndexAsync(serviceTreeId, deploymentPackageId, region), Times.Never);
            this.bocBackendProvider
                .Verify(x => x.UpdateCurrentRolloutSpecPathIndexAsync(
                serviceTreeId, deploymentPackageId, region, Constants.FirstRolloutSpecRelativePathIndex, null, true), Times.Never());
            this.cbasProviderFactory.Verify(x => x.CreateCbasProvider(AzureCloud.Public), Times.Once());
            this.cbasProvider.Verify(x => x.GetRegionSpecificArtifactDetailsAsync(serviceTreeId, deploymentPackageId, region), Times.Once);
        }

        private void VerifyLog(LogLevel logLevel, string message, Times times)
        {
            switch (logLevel)
            {
                case LogLevel.Informational:
                    this.logger.Verify(m => m.LogInformation(It.Is<string>(msg => msg.Contains(message))), times);
                    break;
                case LogLevel.Warning:
                    this.logger.Verify(m => m.LogWarning(It.Is<string>(msg => msg.Contains(message))), times);
                    break;
                case LogLevel.Error:
                    this.logger.Verify(m => m.LogError(It.Is<string>(msg => msg.Contains(message))), times);
                    break;
                case LogLevel.Verbose:
                    this.logger.Verify(m => m.LogVerbose(It.Is<string>(msg => msg.Contains(message))), times);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(logLevel), logLevel, null);
            }
        }
    }
}
