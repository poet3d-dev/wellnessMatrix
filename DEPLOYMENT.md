# Neuro-wellness Matrix — Web Deployment Guide

This guide covers deploying the Neuro-wellness Matrix app as a web application to production.

## Production Build

The production web build has been generated in the `dist/` folder with all 24 routes pre-rendered as static HTML files.

### Build Output
- **CSS Bundle:** `_expo/static/css/web-*.css` (9.33 kB)
- **JS Bundle:** `_expo/static/js/web/entry-*.js` (2.69 MB)
- **Static Routes:** 24 pre-rendered HTML pages
- **Total Size:** ~3.5 MB (highly optimized)

---

## Deployment Options

### **Option 1: Vercel (Recommended — Easiest)**

Vercel is the creator of Next.js and provides the best experience for React/Expo web apps.

#### Steps:
1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/wellness-matrix.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and sign up (free)**

3. **Import your GitHub repository:**
   - Click "New Project"
   - Select your repository
   - Vercel auto-detects the Expo setup
   - Click "Deploy"

4. **Configure environment variables (if needed):**
   - Go to Project Settings → Environment Variables
   - Add any required API keys or secrets

5. **Your app is live!** Vercel provides a free `.vercel.app` domain

#### Benefits:
- ✅ Free tier (unlimited deployments)
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN for fast loading
- ✅ Preview deployments for pull requests
- ✅ One-click rollbacks

---

### **Option 2: Netlify**

Netlify is another excellent option with similar features to Vercel.

#### Steps:
1. **Push your code to GitHub** (same as Vercel)

2. **Go to [netlify.com](https://netlify.com) and sign up (free)**

3. **Connect your repository:**
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose your repository
   - Netlify auto-detects the build command
   - Click "Deploy site"

4. **Your app is live!** Netlify provides a free `.netlify.app` domain

#### Benefits:
- ✅ Free tier (unlimited deployments)
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN
- ✅ Form submissions and serverless functions
- ✅ Analytics included

---

### **Option 3: Firebase Hosting**

Good option if you're using Firebase for backend services.

#### Steps:
1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and deploy:**
   ```bash
   npm run build && npx expo export --platform web
   firebase deploy
   ```

#### Benefits:
- ✅ Free tier (5 GB storage, 1 GB/month transfer)
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN
- ✅ Integrates with Firebase backend

---

### **Option 4: Self-Host on Your Own Server**

If you have your own server or VPS:

#### Steps:
1. **Build the app:**
   ```bash
   npm run build && npx expo export --platform web
   ```

2. **Copy `dist/` folder to your server:**
   ```bash
   scp -r dist/* user@your-server.com:/var/www/wellness-matrix/
   ```

3. **Configure your web server (Nginx example):**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     root /var/www/wellness-matrix;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     # Cache static assets
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

4. **Set up SSL with Let's Encrypt:**
   ```bash
   certbot certonly --webroot -w /var/www/wellness-matrix -d your-domain.com
   ```

---

## Custom Domain Setup

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update your domain's DNS records (Vercel provides instructions)

### For Netlify:
1. Go to Site Settings → Domain management
2. Add your custom domain
3. Update your domain's DNS records (Netlify provides instructions)

---

## Environment Variables

If your app uses environment variables (API keys, etc.):

### For Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development

### For Netlify:
1. Go to Site Settings → Build & Deploy → Environment
2. Add each variable

### Example Variables:
```
VITE_APP_TITLE=Neuro-wellness Matrix
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

---

## Progressive Web App (PWA) Features

The app automatically includes PWA features:
- ✅ Installable on mobile home screen
- ✅ Works offline (with service workers)
- ✅ App-like experience on mobile

Users can install by:
1. **On iOS:** Safari → Share → Add to Home Screen
2. **On Android:** Chrome → Menu → Install app

---

## Performance Optimization

The production build includes:
- ✅ Code splitting (only load what's needed)
- ✅ CSS minification
- ✅ JavaScript compression
- ✅ Image optimization
- ✅ Static pre-rendering (24 routes)

### Bundle Size:
- JS: 2.69 MB (gzipped: ~700 KB)
- CSS: 9.33 KB (gzipped: ~2 KB)
- Total: ~3.5 MB

---

## Monitoring & Analytics

### For Vercel:
- Built-in analytics at vercel.com/dashboard
- Web Vitals tracking
- Error reporting

### For Netlify:
- Built-in analytics at netlify.com/dashboard
- Form submissions tracking
- Function logs

### Add Google Analytics (Optional):
Add to `app/_layout.tsx`:
```tsx
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'GA_ID');
  }, []);

  // ... rest of layout
}
```

---

## Troubleshooting

### Build fails on deployment:
1. Check build logs in Vercel/Netlify dashboard
2. Ensure all dependencies are in `package.json`
3. Run `npm run build` locally to test

### App shows blank page:
1. Check browser console for errors
2. Ensure `dist/` folder is deployed
3. Check that rewrite rules are configured (Vercel/Netlify)

### Routes not working:
1. Verify `vercel.json` or `netlify.toml` is in root
2. Check that rewrite rule points to `/index.html`
3. Clear browser cache

---

## Next Steps

1. **Choose a hosting platform** (Vercel recommended for easiest setup)
2. **Push code to GitHub**
3. **Connect your repository** to your hosting platform
4. **Deploy!** (usually automatic on every push)
5. **Set up custom domain** (optional)
6. **Monitor performance** via platform dashboard

---

## Support

For issues with:
- **Vercel:** https://vercel.com/support
- **Netlify:** https://support.netlify.com
- **Expo Web:** https://docs.expo.dev/router/introduction/
