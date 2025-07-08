// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeButton = document.querySelector('.close-button');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA APOD API endpoint (using demo_key for simplicity)
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'DEMO_KEY'; // For production, get your own key at api.nasa.gov

// Function to fetch space images from NASA's APOD API
async function fetchSpaceImages(startDate, endDate) {
  try {
    // Build the API URL with date range parameters
    const url = `${NASA_API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Make the API request
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Convert response to JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching space images:', error);
    throw error;
  }
}

// Function to create a gallery item HTML for each space image
function createGalleryItem(imageData) {
  // Create the main container for this gallery item
  const galleryItem = document.createElement('div');
  galleryItem.className = 'gallery-item';
  
  // Only show images (not videos) for simplicity
  if (imageData.media_type === 'image') {
    // Use template literals to create the HTML content (no explanation on main page)
    galleryItem.innerHTML = `
      <img src="${imageData.url}" alt="${imageData.title}" />
      <h3>${imageData.title}</h3>
      <p><strong>Date:</strong> ${imageData.date}</p>
    `;
  } else {
    // For videos, show a placeholder with title and date
    galleryItem.innerHTML = `
      <div style="height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
        <span>🎥 Video Content</span>
      </div>
      <h3>${imageData.title}</h3>
      <p><strong>Date:</strong> ${imageData.date}</p>
    `;
  }
  
  // Add click event listener to open modal when gallery item is clicked
  galleryItem.addEventListener('click', () => {
    openModal(imageData);
  });
  
  return galleryItem;
}

// Function to display all the space images in the gallery
function displayGallery(imageDataArray) {
  // Clear any existing content in the gallery
  gallery.innerHTML = '';
  
  // Check if we have any images to display
  if (imageDataArray.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">😕</div>
        <p>No space images found for the selected date range.</p>
      </div>
    `;
    return;
  }
  
  // Create gallery items for each image and add them to the gallery
  imageDataArray.forEach(imageData => {
    const galleryItem = createGalleryItem(imageData);
    gallery.appendChild(galleryItem);
  });
}

// Function to show loading state while fetching images
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⏳</div>
      <p>Space images loading...</p>
    </div>
  `;
}

// Function to show error message if something goes wrong
function showError(errorMessage) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">❌</div>
      <p>Sorry, something went wrong: ${errorMessage}</p>
      <p>Please try again with a different date range.</p>
    </div>
  `;
}

// Main function to handle the "Get Space Images" button click
async function handleGetImages() {
  // Get the selected date range from the input fields
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Make sure both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  // Make sure start date is before or equal to end date
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be before or equal to end date.');
    return;
  }
  
  try {
    // Show loading message while we fetch the data
    showLoading();
    
    // Fetch the space images from NASA's API
    const spaceImages = await fetchSpaceImages(startDate, endDate);
    
    // Display the images in the gallery
    displayGallery(spaceImages);
    
  } catch (error) {
    // Show error message if something went wrong
    showError(error.message);
  }
}

// Modal functionality

// Function to open the modal with image details
function openModal(imageData) {
  // Set the modal content with the image data
  modalTitle.textContent = imageData.title;
  modalDate.textContent = `Date: ${imageData.date}`;
  modalExplanation.textContent = imageData.explanation;
  
  // Handle images vs videos differently
  if (imageData.media_type === 'image') {
    // Show the full-size image
    modalImage.src = imageData.url;
    modalImage.alt = imageData.title;
    modalImage.style.display = 'block';
  } else {
    // For videos, hide the image element
    modalImage.style.display = 'none';
  }
  
  // Show the modal
  modal.style.display = 'block';
  
  // Prevent body from scrolling when modal is open
  document.body.style.overflow = 'hidden';
}

// Function to close the modal
function closeModal() {
  // Hide the modal
  modal.style.display = 'none';
  
  // Re-enable body scrolling
  document.body.style.overflow = 'auto';
}

// Event listeners for modal closing

// Close modal when user clicks the X button
closeButton.addEventListener('click', closeModal);

// Close modal when user clicks outside the modal content
modal.addEventListener('click', (event) => {
  // Only close if the click was on the modal background, not the content
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal when user presses the Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

// Add click event listener to the "Get Space Images" button
getImagesBtn.addEventListener('click', handleGetImages);
