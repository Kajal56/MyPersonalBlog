"use client";
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { useAdminMode } from './AdminModeContext';
import SuggestionModal from './SuggestionModal';

export default function EntryCard({ type, entry, fields, onEdit, onDelete, cardClassName }) {
  // Fix: Define handleDeleteClick for Delete button
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  const { isAdminMode } = useAdminMode();
  const [isEditing, setIsEditing] = useState(false);
  // Enable modal for book, trip, and movie types (not in admin mode)
  const isBookType = type === 'book' || type === 'books';
  const isTripType = type === 'trip' || type === 'trips';
  const isMovieType = type === 'movie' || type === 'movies';
  const isRestaurantType = type === 'restaurant' || type === 'restaurants';
  const isFlatType = type === 'flat' || type === 'flats';
  const cardClickable = (isBookType || isTripType || isMovieType || isRestaurantType || isFlatType);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const detailFields = fields ? fields.filter(f => f.value) : [];

  // Correct placement: Define handleDeleteConfirm above return
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(entry);
    }
    setShowDeleteDialog(false);
  };

  // Fix: Define handleDeleteCancel for ConfirmDialog
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Fix: Define handleEdit for Edit button
  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry);
    }
  };
  // ...existing JSX and logic...
  return (
    <>
      <div
        className={cardClassName || "bg-gradient-to-br from-[#2D0036] to-[#6600CC] shadow-md p-3 sm:p-5 md:p-6 hover:shadow-lg transition-shadow w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"}
        onClick={() => cardClickable && setShowDetailModal(true)}
        style={cardClickable ? { cursor: 'pointer' } : {}}
        tabIndex={cardClickable ? 0 : undefined}
        role={cardClickable ? 'button' : undefined}
        aria-label={cardClickable ? 'View entry details' : undefined}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2">
            {entry.title || entry.name}
          </h3>
          {isAdminMode && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-purple-300 hover:text-white text-sm"
              >
                Edit
              </button>
              <button 
                onClick={handleDeleteClick}
                className="text-red-400 hover:text-white text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex items-start space-x-2">
              {field.icon && <span className="text-xs sm:text-sm mt-0.5 text-purple-300">{field.icon}</span>}
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-purple-200">{field.label}:</span>
                <p className="text-xs sm:text-sm text-white break-words">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-900">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-1 sm:px-2 py-0.5 sm:py-1 bg-purple-900 text-purple-200 text-xs"
                  style={{ borderRadius: 0 }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {(cardClickable && showDetailModal) && (
        <SuggestionModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-purple-200 mb-2">
              {entry.title || entry.name ||
                (isBookType ? 'Book Review'
                  : isTripType ? 'Trip Details'
                  : isMovieType ? 'Movie Details'
                  : isRestaurantType ? 'Restaurant Details'
                  : isFlatType ? 'Flat Details'
                  : 'Details')}
            </h2>
            {detailFields.length > 0 ? (
              <>
                {detailFields.map((field, idx) => {
                  const highlightLabels = ["author", "rating", "keytakeaway", "director", "location"];
                  const isHighlight = highlightLabels.includes(field.label.toLowerCase().replace(/\s/g, ""));
                  return (
                    <div key={idx} className="flex items-start space-x-2">
                      {field.icon && <span className="text-sm mt-0.5 text-purple-300">{field.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-purple-300">{field.label}:</span>
                        <p className={`text-sm break-words ${isHighlight ? 'text-purple-100 font-semibold' : 'text-gray-100'}`}>{field.value}</p>
                      </div>
                    </div>
                  );
                })}
                {entry.keyTakeaway && !detailFields.some(f => f.label.toLowerCase().replace(/\s/g,"") === "keytakeaway") && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Key Takeaway:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.keyTakeaway}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {entry.title && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Title:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.title}</p>
                    </div>
                  </div>
                )}
                {entry.name && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Name:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.name}</p>
                    </div>
                  </div>
                )}
                {entry.author && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Author:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.author}</p>
                    </div>
                  </div>
                )}
                {entry.director && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Director:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.director}</p>
                    </div>
                  </div>
                )}
                {entry.location && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Location:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.location}</p>
                    </div>
                  </div>
                )}
                {entry.rating && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Rating:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.rating}</p>
                    </div>
                  </div>
                )}
                {entry.keyTakeaway && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-purple-300">Key Takeaway:</span>
                      <p className="text-sm text-purple-100 font-semibold break-words">{entry.keyTakeaway}</p>
                    </div>
                  </div>
                )}
                {(!entry.title && !entry.name && !entry.keyTakeaway && !entry.author && !entry.rating && !entry.director && !entry.location) && (
                  <p className="text-gray-500">No details available for this entry.</p>
                )}
              </>
            )}
            {entry.tags && entry.tags.length > 0 && (
              <div className="pt-2 border-t border-purple-200">
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SuggestionModal>
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Entry"
        message={`Are you sure you want to delete "${entry.title || entry.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
