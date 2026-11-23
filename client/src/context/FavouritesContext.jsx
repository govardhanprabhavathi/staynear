import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const { isAuthenticated, isStudent } = useAuth();
  const { showToast } = useNotification();
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavourites = async () => {
    if (!isAuthenticated || !isStudent) {
      setFavouriteIds(new Set());
      setFavourites([]);
      return;
    }
    try {
      setLoading(true);
      const favList = await studentService.getFavourites();
      setFavourites(favList);
      setFavouriteIds(new Set(favList.map((p) => p._id)));
    } catch (err) {
      console.warn('Failed to load favourites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, [isAuthenticated, isStudent]);

  const isFavorited = (propertyId) => {
    return favouriteIds.has(propertyId);
  };

  const toggleFavourite = async (property) => {
    if (!isAuthenticated) {
      showToast('Please sign in as a student to save favourite properties.', 'info');
      return false;
    }
    if (!isStudent) {
      showToast('Only student accounts can save properties to favourites.', 'warning');
      return false;
    }

    const propId = property._id;
    const isCurrentlySaved = favouriteIds.has(propId);

    try {
      if (isCurrentlySaved) {
        await studentService.removeFavourite(propId);
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(propId);
          return next;
        });
        setFavourites((prev) => prev.filter((p) => p._id !== propId));
        showToast('Removed from saved properties', 'info');
      } else {
        await studentService.addFavourite(propId);
        setFavouriteIds((prev) => new Set(prev).add(propId));
        setFavourites((prev) => [property, ...prev]);
        showToast('Saved to your favourite properties!', 'success');
      }
      return true;
    } catch (err) {
      showToast('Could not update favourite status.', 'error');
      return false;
    }
  };

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        favouriteIds,
        isFavorited,
        toggleFavourite,
        refreshFavourites: fetchFavourites,
        loading,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
