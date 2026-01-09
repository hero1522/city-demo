# TikTok Clone - Standalone Version

A standalone TikTok-style video player that runs directly in your browser without any build tools or frameworks.

## Features

✅ Vertical video scrolling (like TikTok)
✅ Snap scrolling between videos
✅ Play/Pause on click
✅ Like button with counter
✅ Comment and share counts
✅ Animated music text
✅ Spinning vinyl record animation
✅ Auto-play videos when scrolled into view
✅ Responsive design for mobile and desktop

## How to Use

1. **Open the file**
   - Simply open `index.html` in your web browser
   - No installation or build process required!

2. **Add your own videos**
   - Edit `app.js`
   - Replace the video URLs in the `videos` array with your own
   - You can use local video files or URLs

3. **Customize**
   - Edit `style.css` to change colors, sizes, animations
   - Modify `app.js` to add new features

## Using Your Own Videos

### Option 1: Local Videos
Place your video files in the same folder and reference them:
```javascript
{
    url: './my-video.mp4',
    username: 'yourname',
    description: 'Your description',
    // ... rest of the data
}
```

### Option 2: Online Videos
Use direct video URLs from your server or CDN:
```javascript
{
    url: 'https://your-domain.com/video.mp4',
    username: 'yourname',
    description: 'Your description',
    // ... rest of the data
}
```

## Controls

- **Click video**: Play/Pause
- **Scroll**: Navigate between videos
- **Heart icon**: Like/Unlike
- Videos auto-play when scrolled into view

## Browser Compatibility

Works on all modern browsers:
- Chrome, Edge, Firefox, Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Tips

- Use MP4 format for best compatibility
- Keep videos under 50MB for smooth playback
- Use portrait orientation (9:16) for best TikTok-like experience
- Videos will auto-loop when they finish

Enjoy your TikTok clone! 🎉
