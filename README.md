# TimeChain Alpha Landing Page

A modern, interactive landing page built with GSAP animations and scroll-triggered effects, showcasing the TimeChain Alpha brand and mission.

## Features

- **GSAP-Powered Animations**: Smooth, professional animations using GSAP 3.12.5
- **Scroll-Triggered Storytelling**: Elements animate as you scroll, creating an engaging narrative
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Brand-Aligned Design**: Uses official brand colors, typography, and messaging
- **Performance Optimized**: Lightweight and fast-loading

## Files Structure

```
├── index.html      # Main HTML structure
├── styles.css      # All styling and brand colors
├── script.js       # GSAP animations and interactions
└── README.md       # This file
```

## Brand Colors

- **Primary**: #004D99 (Deep Blue)
- **Secondary**: #336699 (Medium Blue)
- **Accent**: #FFC107 (Golden Yellow)
- **Neutrals**: #F5F5F5, #CCCCCC, #666666

## Typography

- **Headings**: Montserrat (Bold, Semi-Bold)
- **Body**: Open Sans (Regular, Semi-Bold)

## Sections

1. **Hero**: Main introduction with animated title and chart visualization
2. **Mission**: Who we are and what we stand for
3. **Services**: What we do - key offerings
4. **Why**: Why we do it - mission and purpose
5. **Values**: Core values (Transparency, Insight, Empowerment, Excellence)
6. **Pitch**: Elevator pitch and value proposition
7. **Contact**: Contact button and call-to-action
8. **Footer**: Brand information and links

## How to Use

1. Open `index.html` in a modern web browser
2. The page uses CDN links for GSAP, so an internet connection is required
3. All animations are automatic and triggered by scroll position

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary: #004D99;
    --secondary: #336699;
    --accent: #FFC107;
    /* ... */
}
```

### Adjusting Animation Speed
Modify animation durations in `script.js`:
```javascript
gsap.to(element, {
    duration: 0.8, // Change this value
    // ...
});
```

### Adding Content
Simply edit the HTML in `index.html` - the animations will automatically apply to elements with `data-split`, `data-card`, or `data-value` attributes.

## Contact

The contact button links to: `mailto:contact@timechainalpha.com`

You can change this in the HTML by updating the `href` attribute of the contact button.

## Notes

- All GSAP libraries are loaded via CDN
- No build process required - works directly in the browser
- Optimized for performance with efficient animations
- All animations respect user preferences (reduced motion can be added if needed)

