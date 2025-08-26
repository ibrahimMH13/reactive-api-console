import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from '../Sidebar';
import apiSlice from '../../../store/slices/apiSlice';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Sidebar', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    
    store = configureStore({
      reducer: {
        api: apiSlice,
      },
    });
  });

  const renderSidebar = () => {
    return render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );
  };

  it('should render API Controls title', () => {
    renderSidebar();
    expect(screen.getByText('API Controls')).toBeInTheDocument();
  });

  it('should render all API configurations', () => {
    renderSidebar();
    
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Cat Facts')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Chuck Norris')).toBeInTheDocument();
    expect(screen.getByText('Bored API')).toBeInTheDocument();
    expect(screen.getByText('Custom Backend')).toBeInTheDocument();
  });

  it('should display correct descriptions for APIs', () => {
    renderSidebar();
    
    expect(screen.getByText('Get weather data for cities')).toBeInTheDocument();
    expect(screen.getByText('Random cat facts')).toBeInTheDocument();
    expect(screen.getByText('Search GitHub users')).toBeInTheDocument();
    expect(screen.getByText('Chuck Norris jokes')).toBeInTheDocument();
    expect(screen.getByText('Activity suggestions')).toBeInTheDocument();
    expect(screen.getByText('Your custom data')).toBeInTheDocument();
  });

  it('should show active status for enabled APIs', () => {
    renderSidebar();
    
    // All APIs should be active by default
    const activeElements = screen.getAllByText('Active');
    expect(activeElements).toHaveLength(6);
  });

  it('should show disabled status when API is disabled', () => {
    renderSidebar();
    
    // Click the toggle button for weather API
    const weatherToggle = screen.getAllByRole('button')[1]; // First button is weather toggle
    fireEvent.click(weatherToggle);
    
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getAllByText('Active')).toHaveLength(5);
  });

  it('should toggle API when clicking toggle button', () => {
    renderSidebar();
    
    // Click weather API toggle
    const weatherToggle = screen.getAllByRole('button')[1];
    fireEvent.click(weatherToggle);
    
    // Check if localStorage was called to save the change
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'activeApis',
      expect.stringContaining('catfacts') // Weather should be removed
    );
  });

  it('should display result count for each API', () => {
    renderSidebar();
    
    // All APIs should show 0 results initially
    const resultElements = screen.getAllByText('0 results');
    expect(resultElements).toHaveLength(6);
  });

  it('should show total active APIs count', () => {
    renderSidebar();
    
    expect(screen.getByText('6 of 6 APIs active')).toBeInTheDocument();
  });

  it('should update active count when APIs are toggled', () => {
    renderSidebar();
    
    // Disable one API
    const weatherToggle = screen.getAllByRole('button')[1];
    fireEvent.click(weatherToggle);
    
    expect(screen.getByText('5 of 6 APIs active')).toBeInTheDocument();
  });

  it('should have Enable All button when not all APIs are active', () => {
    renderSidebar();
    
    // Disable one API
    const weatherToggle = screen.getAllByRole('button')[1];
    fireEvent.click(weatherToggle);
    
    expect(screen.getByText('Enable All')).toBeInTheDocument();
  });

  it('should have Disable All button when all APIs are active', () => {
    renderSidebar();
    
    expect(screen.getByText('Disable All')).toBeInTheDocument();
  });

  it('should enable all APIs when clicking Enable All', () => {
    renderSidebar();
    
    // First disable one API
    const weatherToggle = screen.getAllByRole('button')[1];
    fireEvent.click(weatherToggle);
    
    // Then click Enable All
    const enableAllButton = screen.getByText('Enable All');
    fireEvent.click(enableAllButton);
    
    expect(screen.getByText('6 of 6 APIs active')).toBeInTheDocument();
  });

  it('should disable all APIs when clicking Disable All', () => {
    renderSidebar();
    
    const disableAllButton = screen.getByText('Disable All');
    fireEvent.click(disableAllButton);
    
    expect(screen.getByText('0 of 6 APIs active')).toBeInTheDocument();
    expect(screen.getAllByText('Disabled')).toHaveLength(6);
  });

  it('should render API icons', () => {
    renderSidebar();
    
    // Check if emojis are rendered (they appear as text content)
    expect(screen.getByText('🌤️')).toBeInTheDocument(); // Weather
    expect(screen.getByText('🐱')).toBeInTheDocument(); // Cat Facts
    expect(screen.getByText('👨‍💻')).toBeInTheDocument(); // GitHub
    expect(screen.getByText('⚡')).toBeInTheDocument(); // Chuck Norris
    expect(screen.getByText('🎯')).toBeInTheDocument(); // Bored
    expect(screen.getByText('🔧')).toBeInTheDocument(); // Custom
  });

  it('should log user toggle actions', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderSidebar();
    
    // Click weather API toggle
    const weatherToggle = screen.getAllByRole('button')[1];
    fireEvent.click(weatherToggle);
    
    expect(consoleSpy).toHaveBeenCalledWith('🔘 User toggling API: weather');
    expect(consoleSpy).toHaveBeenCalledWith('🔘 Current active APIs:', expect.any(Array));
    
    consoleSpy.mockRestore();
  });
});