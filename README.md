# SocialBrand 1980 - Website & CMS

A modern, neon-themed article publishing platform built with Next.js and Sanity CMS.

🌐 **Live:** [socialbrand1980.github.io/Company](https://socialbrand1980.github.io/Company)

---

## ✨ Features

### 🎨 **Frontend**
- ✅ **Neon Aesthetic Design** - Modern glassmorphism with neon accents
- ✅ **Responsive Layout** - Mobile, tablet, and desktop optimized
- ✅ **Dark Mode** - Easy on the eyes, perfect for reading
- ✅ **Smooth Animations** - Polished transitions and hover effects

### 📝 **Articles**
- ✅ **Article Listing** - Filter by category (Brand Strategy, Social Media, etc.)
- ✅ **Featured Articles** - Highlight important content
- ✅ **Article Detail Page** - Full article view with rich content
- ✅ **Read Time Display** - Show estimated reading time
- ✅ **Related Articles** - Suggest similar content
- ✅ **Category Filtering** - Browse by topic

### 🔗 **Share & Engagement**
- ✅ **Share Button** - Native share (mobile) / Copy link (desktop)
- ✅ **Save/Bookmark** - Save articles to localStorage
- ✅ **Discuss via WhatsApp** - Direct chat about articles
- ✅ **Subscribe Notifications** - Get notified about new articles
  - WhatsApp subscription
  - Email subscription (Formspree)

### 🎯 **Navigation**
- ✅ **Sticky Navbar** - Always accessible navigation
- ✅ **Smooth Scroll** - Anchor links with smooth scrolling (homepage)
- ✅ **Mobile Menu** - Hamburger menu for mobile devices
- ✅ **Active State** - Visual feedback on current page

### 📊 **CMS (Sanity)**
- ✅ **Article Management** - Create, edit, delete articles
- ✅ **Rich Text Editor** - Block content with formatting
- ✅ **Image Upload** - Main images with alt text
- ✅ **Category Management** - 6 predefined categories
- ✅ **Featured Toggle** - Mark articles as featured
- ✅ **Slug Generation** - Auto-generate URL slugs
- ✅ **Preview** - Real-time content preview

### 🚀 **Performance**
- ✅ **Static Site Generation** - Fast page loads
- ✅ **Image Optimization** - Optimized image delivery
- ✅ **Client-Side Data Fetching** - Fresh content from Sanity
- ✅ **LocalStorage Caching** - Saved articles persist

### 🔒 **Data & Privacy**
- ✅ **No Backend Required** - Serverless architecture
- ✅ **LocalStorage** - User data stays on device
- ✅ **Environment Variables** - Secure API keys
- ✅ **CORS Protection** - Sanity API security

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI, shadcn/ui |
| **CMS** | Sanity.io |
| **Deployment** | Vercel / GitHub Pages |
| **Forms** | Formspree |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
SocialBrand1980/
├── app/
│   ├── article/
│   │   └── [slug]/          # Article detail page
│   ├── studio/[[...tool]]/  # Sanity Studio (dev only)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── article-detail-page.tsx
│   ├── article-list.tsx
│   ├── footer.tsx
│   ├── navigation.tsx
│   ├── share-modal.tsx
│   ├── subscription-form.tsx
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── sanity.ts            # Sanity client config
│   └── utils.ts
├── sanity/
│   ├── schemaTypes/
│   │   ├── article.ts       # Article schema
│   │   └── index.ts
│   └── ...
├── .env.local               # Environment variables (local)
├── .env.example             # Environment template
├── next.config.mjs
├── package.json
├── sanity.cli.ts
├── sanity.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/pnpm
- Sanity account (free)
- GitHub account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/socialbrand1980/Company.git
   cd Company
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Website: http://localhost:3000
   - Sanity Studio: http://localhost:3000/studio

---

## 📝 Content Management

### Access Sanity Studio

**Local Development:**
```bash
npm run dev
# Open http://localhost:3000/studio
```

**Production (Vercel):**
- Studio is disabled in production
- Use local studio for content management
- Changes sync to Sanity cloud instantly

### Create New Article

1. Open Sanity Studio
2. Click **Articles** in sidebar
3. Click **+ Create new**
4. Fill in the form:
   - **Title** - Article title
   - **Slug** - Auto-generated URL
   - **Excerpt** - Short description (max 200 chars)
   - **Content** - Rich text editor
   - **Category** - Select from dropdown
   - **Author** - Default: "SocialBrand Team"
   - **Published At** - Auto-set to now
   - **Read Time** - e.g., "5 min read"
   - **Featured** - Toggle for homepage highlight
   - **Main Image** - Upload cover image
   - **Related Articles** - Link to other articles
5. Click **Publish**

---

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update content"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SANITY_PROJECT_ID`
     - `NEXT_PUBLIC_SANITY_DATASET`
   - Deploy!

3. **Auto-deploy**
   - Every push to `main` triggers deployment
   - Check status at Vercel dashboard

### Option 2: GitHub Pages

1. **Configure workflow**
   - GitHub Actions already set up
   - Add secrets in repository settings

2. **Deploy**
   ```bash
   npm run build:gh
   ```

3. **Access**
   - `https://socialbrand1980.github.io/Company`

---

## 🔧 Configuration

### Sanity Setup

1. **Create Sanity Project**
   ```bash
   npm create sanity@latest
   ```

2. **Configure CORS** (for production)
   - Go to [sanity.io/manage](https://sanity.io/manage)
   - Select project → Settings → API
   - Add CORS Origins:
     - `https://socialbrand1980.github.io`
     - `https://*.vercel.app`

### Formspree Setup (Email Subscriptions)

1. **Register at [formspree.io](https://formspree.io)**
2. **Create new form**
3. **Update Form ID** in `components/subscription-form.tsx`:
   ```typescript
   const formspreeUrl = 'https://formspree.io/f/YOUR_FORM_ID'
   ```

---

## 📊 Features Breakdown

### Share Functionality
| Platform | Method |
|----------|--------|
| **Mobile** | Native share dialog (iOS/Android) |
| **Desktop** | Copy link to clipboard |
| **WhatsApp** | Direct chat with pre-filled message |
| **Instagram** | Manual share via native dialog |

### Save Articles
- Articles saved to browser localStorage
- Persists across sessions
- Visual feedback (button state + toast)
- Find saved: Check browser localStorage → `savedArticles`

### Subscribe Notifications
- **WhatsApp**: Direct message to business number
- **Email**: Formspree integration
- Manual broadcast for new articles (no auto-email yet)

---

## 🎨 Design System

### Colors
- **Primary**: `#2D75FF` (Neon Blue)
- **Accent**: `#FF0080` (Neon Pink)
- **Background**: Dark gradient
- **Glass**: Semi-transparent with blur

### Typography
- **Headings**: Bold, large, tracking-tight
- **Body**: Medium, readable line-height
- **Accent**: Neon text effects

### Components
- **Buttons**: Neon border effects
- **Cards**: Glassmorphism with hover scale
- **Inputs**: Minimal with focus states

---

## 📈 Analytics

Currently using:
- **Vercel Analytics** (built-in, privacy-focused)
- No third-party tracking cookies

---

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ CORS protection on Sanity API
- ✅ No server-side code exposure
- ✅ Client-side data fetching
- ✅ LocalStorage for user preferences

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Sanity.io](https://sanity.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Contact

**SocialBrand 1980**
- Website: [socialbrand1980.github.io/Company](https://socialbrand1980.github.io/Company)
- Email: socialbrand1980@gmail.com
- WhatsApp: +62 811-1980-93

---

## 🚀 Future Enhancements

Planned features:
- [ ] Auto-email notifications (Resend/SendGrid)
- [ ] Push notifications
- [ ] Comments system
- [ ] Search functionality
- [ ] User accounts
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] RSS feed
- [ ] Newsletter integration

---

**Built with ❤️ by SocialBrand 1980 Team**
email: admin@socialbrand1980.com
password: admin123
