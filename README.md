# News Dikhao - Hindi News Portal

A modern, feature-rich news portal built with Next.js 14, Firebase, and Tailwind CSS. Designed to deliver a seamless news reading experience in Hindi and English.

## Features

### For Readers
- 📰 Breaking news section with real-time updates
- 🌐 Bilingual support (Hindi and English)
- 📱 Fully responsive design for all devices
- 🔍 Advanced search functionality
- 📂 Category-based news organization
- 🎯 Personalized news feed
- 💬 Social media integration
- 🔔 Push notifications for breaking news

### For Administrators
- 📊 Comprehensive admin dashboard
- ✍️ Rich text editor for content creation
- 📁 Category management system
- 🖼️ Media management with Cloudinary integration
- 📈 Analytics and traffic monitoring
- 👥 User role management
- 💾 Automated backup system
- 🔄 Content versioning

## Tech Stack

### Frontend
- ⚛️ Next.js 14 (App Router)
- 🎨 Tailwind CSS for styling
- 🧩 Shadcn UI Components
- 📝 TipTap Rich Text Editor
- 🔄 SWR for data fetching

### Backend & Services
- 🔥 Firebase
  - Firestore for database
  - Authentication
  - Cloud Functions
  - Storage
- ☁️ Cloudinary for media management
- 📊 Firebase Analytics

## Getting Started

### Prerequisites
- Node.js 18.x or later
- PNPM package manager
- Firebase account
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WebCodeXorg/test.git
cd test
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
├── app/                  # Next.js app router pages
├── components/          # Reusable components
│   ├── admin/          # Admin dashboard components
│   └── ui/             # UI components (shadcn)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/               # Utility functions and configs
├── public/            # Static assets
└── styles/            # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/WebCodeXorg/test](https://github.com/WebCodeXorg/test)
