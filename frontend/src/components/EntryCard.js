"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from './ConfirmDialog';
import { useAdminMode } from './AdminModeContext';
import SuggestionModal from './SuggestionModal';

export default function EntryCard({ type, entry, fields, onEdit, onDelete, cardClassName }) {
  const router = useRouter();
  
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

  // Handle navigation to slug-based URL
  const handleCardClick = () => {
    if (!cardClickable) return;
    
    if (entry.slug) {
      // Navigate to slug-based URL under personal
      let baseRoute = '';
      if (isMovieType) baseRoute = '/personal/movies';
      else if (isBookType) baseRoute = '/personal/books';
      else if (isTripType) baseRoute = '/personal/trips';
      else if (isRestaurantType) baseRoute = '/personal/restaurants';
      
      if (baseRoute) {
        router.push(`${baseRoute}/${entry.slug}`);
        return;
      }
    }
    
    // Fallback to modal for entries without slugs
    setShowDetailModal(true);
  };

  // Correct placement: Define handleDeleteConfirm above return
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(entry.id);
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
        className={cardClassName || "bg-gradient-to-br from-[#0D0012] to-[#330066] shadow-md p-4 sm:p-5 hover:shadow-lg transition-shadow w-full"}
        onClick={handleCardClick}
        style={cardClickable ? { cursor: 'pointer' } : {}}
        tabIndex={cardClickable ? 0 : undefined}
        role={cardClickable ? 'button' : undefined}
        aria-label={cardClickable ? 'View entry details' : undefined}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2 flex-1 pr-2">
            {entry.title || entry.name}
          </h3>
          {isAdminMode && (
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="text-purple-200 hover:text-white text-xs sm:text-sm px-2 py-1 bg-purple-950 bg-opacity-70"
              >
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                className="text-red-200 hover:text-white text-xs sm:text-sm px-2 py-1 bg-red-950 bg-opacity-70"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex items-start space-x-2">
              {field.icon && <span className="text-sm mt-0.5 text-purple-300 flex-shrink-0">{field.icon}</span>}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-purple-200">{field.label}:</span>
                <p className="text-sm text-white break-words">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-950">
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-950 text-purple-200 text-xs"
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
              <div className="pt-2 border-t border-purple-900">
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-950 text-purple-300 text-xs"
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
