# HilalDigital Components Documentation

## Overview

The HilalDigital components have been unified into 2 separate, dynamic components that replace the previous 4 separate components:

### **Component 1: HilalDigitalList** (List Layout)
- Replaces: `HilalDigital.jsx` and `HilalDigitalUrdu.jsx`
- Layout: Vertical list with thumbnails and inline video player

### **Component 2: HilalDigitalGrid** (Grid Layout)  
- Replaces: `Hillal_Digital_2.jsx` and `HilalDigital2Urdu.jsx`
- Layout: Featured video + sidebar grid

## Component 1: HilalDigitalList

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `string` | `'english'` | Language of the component ('english' or 'urdu') |
| `maxVideos` | `number` | `null` | Maximum number of videos to show (null = all videos) |
| `className` | `string` | `''` | Additional CSS classes |

### Usage Examples

```jsx
// English List Layout (3 videos max)
<HilalDigitalList 
    language="english" 
    maxVideos={3}
/>

// Urdu List Layout (all videos with custom height)
<HilalDigitalList 
    language="urdu" 
    className="overflow-y-auto h-[560px]"
/>
```

### Features
- **API Endpoint**: `/api/videos/`
- **Video Filtering**: Client-side language filtering
- **Responsive Design**: Mobile-first approach
- **Video Player**: Inline iframe when video is clicked
- **Language Support**: English (LTR) and Urdu (RTL)

## Component 2: HilalDigitalGrid

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `string` | `'english'` | Language for styling only ('english' or 'urdu') |
| `className` | `string` | `''` | Additional CSS classes |

### Usage Examples

```jsx
// Grid Layout (shows all videos)
<HilalDigitalGrid 
    language="english"
/>

// Grid Layout with Urdu styling
<HilalDigitalGrid 
    language="urdu"
/>
```

### Features
- **API Endpoint**: `/api/videos/hilal-digital/`
- **Video Display**: Shows all videos (English and Urdu) in order
- **Featured Video**: Large video display
- **Sidebar Grid**: Grid of smaller videos
- **RTL Support**: Proper right-to-left layout for Urdu styling
- **Responsive Design**: Adapts to different screen sizes

## Language Support

### English
- Uses `isEnglishVideo()` filter function
- Left-to-right (LTR) text direction
- English titles and error messages
- Shows "English" language label

### Urdu
- Uses `isUrduVideo()` filter function
- Right-to-left (RTL) text direction
- Urdu titles and error messages
- No language label (cleaner design)
- Urdu font classes

## File Structure

### New Unified Components
- `/components/shared/HilalDigitalList.jsx` - List layout component
- `/components/shared/HilalDigitalGrid.jsx` - Grid layout component
- `/components/shared/HilalDigitalDemo.jsx` - Demo component for testing

### Direct Usage
The components are now used directly from `/components/shared/` without any wrapper files:
- `HilalDigitalList` - Used directly with language prop
- `HilalDigitalGrid` - Used directly with language prop

## Migration Guide

### Before (4 separate components)
```jsx
// Old way - 4 separate components
import HilalDigital from '../Home/HilalDigital';
import HilalDigitalUrdu from '../urdu/HilalDigitalUrdu';
import HilalDigital2 from '../Home/Hillal_Digital_2';
import HilalDigital2Urdu from '../urdu/HilalDigital2Urdu';
```

### After (2 unified components)
```jsx
// New way - 2 unified components used directly
import HilalDigitalList from '../shared/HilalDigitalList';
import HilalDigitalGrid from '../shared/HilalDigitalGrid';

// All configurations with props
<HilalDigitalList language="english" maxVideos={3} />
<HilalDigitalList language="urdu" className="overflow-y-auto h-[560px]" />
<HilalDigitalGrid language="english" />
<HilalDigitalGrid language="urdu" />

// In lazy loading (as used in pages)
const HilalDigital = lazy(() => import("../components/shared/HilalDigitalList"));
const HilalDigital2 = lazy(() => import("../components/shared/HilalDigitalGrid"));

// Usage with props
<HilalDigital language="english" maxVideos={3} />
<HilalDigital2 language="english" />
```

## Video Filtering

Both components use utility functions from `videoFilters.js`:

- `isEnglishVideo(video)`: Determines if a video is in English
- `isUrduVideo(video)`: Determines if a video is in Urdu

Filtering is based on:
1. Explicit `language` field
2. Content analysis (Unicode ranges for Arabic/Urdu characters)
3. Common Urdu words in English transliteration

## Benefits

1. **Code Reduction**: 4 components → 2 components (50% reduction)
2. **Maintainability**: Single source of truth for each layout type
3. **Consistency**: Unified behavior and styling within each layout
4. **Flexibility**: Easy to add new languages or modify layouts
5. **Performance**: Optimized data fetching and rendering
6. **Backward Compatibility**: Existing imports still work
7. **Clear Separation**: List and grid layouts are separate concerns

## Testing

Use the `HilalDigitalDemo` component to test all configurations:

```jsx
import HilalDigitalDemo from '../shared/HilalDigitalDemo';

<HilalDigitalDemo />
```

This will render all 4 possible configurations for easy testing and comparison.

## API Integration

### HilalDigitalList
- **Endpoint**: `/api/videos/`
- **Data**: Array of video objects
- **Filtering**: Client-side language filtering
- **Performance**: Can limit number of videos with `maxVideos` prop

### HilalDigitalGrid
- **Endpoint**: `/api/videos/hilal-digital/`
- **Data**: Object with `featured_video` and `other_videos`
- **Display**: Shows all videos (English and Urdu) in order
- **Performance**: Structured data for better layout control
