# 📚 Marketplace - Buy & Sell PDF Notes

Complete implementation guide for the MCQ Beast Marketplace where users can buy and sell PDF study materials.

## 🎯 Overview

The Marketplace is a peer-to-peer platform where:
- **Sellers** can upload and monetize their PDF notes, study materials, eBooks, etc.
- **Buyers** can discover, purchase, and download quality study content
- **Revenue Share**: Creators earn 70% of each sale

## 📱 User Flows

### 🛒 Buying Content Flow

1. **Browse Marketplace**
   - Open app → Marketplace tab
   - Browse content with filters (PDF, Video, Notes, etc.)
   - Search for specific content
   - View content cards with ratings, price, and stats

2. **View Content Details**
   - Tap on any content card
   - See full details: description, creator info, reviews, stats
   - Check thumbnail preview
   - View pricing (Free or Paid)

3. **Purchase Content**
   - Tap "Buy Now" button
   - **For Free Content**: Instant download access
   - **For Paid Content**: 
     - Confirm purchase dialog
     - Amount deducted from wallet
     - If insufficient balance → Redirect to wallet recharge
     - Success message → Access to download

4. **Download Content**
   - After purchase → Tap "Download" button
   - OR Navigate to "My Purchases" screen
   - Tap download on any purchased item
   - Content opens/downloads to device

### 💰 Selling Content Flow

1. **Upload Content**
   - Marketplace tab → Tap "Sell" button
   - Fill content details:
     - Content Type (PDF Notes, Video, eBook, etc.)
     - Title
     - Description
     - Price (₹)
     - Category
     - Relevant Exams
     - Tags
   - Upload PDF file (uploaded to Cloudinary)
   - Upload thumbnail image (optional)
   - Submit for upload

2. **Manage Uploads**
   - Marketplace → Tap package icon (My Uploads)
   - View all uploaded content
   - See stats: ratings, downloads, views, reviews
   - Track earnings per item
   - View total earnings summary

3. **Earnings**
   - 70% revenue share on each sale
   - Real-time earnings tracking
   - Withdrawal through Creator Dashboard

## 🗂️ Screen Structure

### 1. MarketplaceScreen
**Location**: `src/screens/Marketplace/MarketplaceScreen.tsx`

**Features**:
- Header with "Sell" and "My Uploads" buttons
- Search bar with clear functionality
- Content type filters (All, PDF, Video, Notes, Practice)
- Grid/List view of content cards
- Each card shows:
  - Thumbnail image
  - Title
  - Creator name
  - Rating & review count
  - Download/purchase count
  - Views count
  - Price or "FREE" badge

**Navigation**:
- "Sell" button → UploadContentScreen
- Package icon → MyUploadsScreen
- Content card → ContentDetailsScreen

### 2. ContentDetailsScreen
**Location**: `src/screens/Marketplace/ContentDetailsScreen.tsx`

**Features**:
- Cover image
- Content type badge
- Title and description
- Creator information with stats
- Overall stats (Rating, Purchases, Views)
- Tags
- Reviews section with verified purchase badges
- Bottom purchase bar

**Actions**:
- **Not Purchased**: "Buy Now" or "Get Free" button
- **Already Purchased**: "Download" button (green)
- Handles wallet balance check
- Redirects to wallet on insufficient balance

### 3. UploadContentScreen
**Location**: `src/screens/creator/UploadContentScreen.tsx`

**Features**:
- Content type selection with icons
- Title input
- Description textarea
- Price input (numeric)
- Category chips
- Multi-select exams
- Tags input
- PDF file picker with Cloudinary upload
- Thumbnail image picker with Cloudinary upload
- Upload progress indicators
- Success confirmations
- Information note about revenue share

**Validation**:
- Title required
- Description required
- Valid price (numeric)
- Category required
- At least one exam required
- File upload required

### 4. MyUploadsScreen
**Location**: `src/screens/Marketplace/MyUploadsScreen.tsx`

**Features**:
- Summary cards showing:
  - Total items uploaded
  - Total sales count
  - Total earnings (₹)
- List of uploaded content with:
  - Thumbnail
  - Title
  - Price/FREE badge
  - Stats (rating, downloads, views, reviews)
  - Calculated earnings per item
- Pull-to-refresh
- Empty state with upload CTA
- Navigation to upload new content

### 5. MyPurchasesScreen
**Location**: `src/screens/Marketplace/MyPurchasesScreen.tsx`

**Features**:
- List of all purchased content
- Each card shows:
  - Content type icon
  - Title
  - Creator name
  - Purchase date
  - Download count
  - Final price paid
- Download button on each card
- Opens download link in browser
- Handles multiple file downloads

## 🔗 API Endpoints

### Content APIs
```typescript
// Browse content
GET /content
Query params: examId, type, category, search, minPrice, maxPrice, page, limit

// Get content details
GET /content/details/:contentId

// Purchase content
POST /content/purchase/:contentId
Body: { referralCode?: string }

// Get my purchases
GET /content/my-purchases

// Download content
GET /content/download/:purchaseId

// Add review
POST /content/review/:contentId
Body: { rating: number, review: string }

// Track view
POST /content/view/:contentId
```

### Creator APIs
```typescript
// Upload new content
POST /creator/content
Body: {
  title, description, price, contentType, category,
  tags[], exams[], fileUrl, thumbnailUrl
}

// Get my uploads
GET /creator/content

// Get creator dashboard
GET /creator/dashboard

// Get earnings
GET /creator/earnings
```

## 💾 Data Models

### Content
```typescript
{
  _id: string
  title: string
  description: string
  contentType: 'pdf' | 'video' | 'ebook' | 'notes' | 'practice_set'
  thumbnail?: string
  price: number
  isFree: boolean
  rating: number
  reviewCount: number
  purchaseCount: number
  totalViews: number
  exam: { _id: string, name: string }
  category: string
  creator: {
    _id: string
    name: string
    avatar?: string
    creatorProfile: {
      rating: number
      totalContentSold: number
    }
  }
  isPurchased: boolean
  createdAt: string
}
```

### Purchase
```typescript
{
  _id: string
  content: Content
  price: number
  finalPrice: number
  downloadCount: number
  purchasedAt: string
  lastDownloadedAt?: string
}
```

## 🎨 Design System

### Colors
- Primary: `#6366F1` (Indigo)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Gray backgrounds: `#F8F9FA`, `#F3F4F6`

### Typography
- Header: 24px, bold
- Title: 16-20px, semibold
- Body: 14-15px, regular
- Caption: 12-13px, regular

### Components
- Cards: rounded-12, elevation-2
- Buttons: rounded-8 to rounded-12
- Chips: rounded-20
- Icons: 16-24px (Material Community Icons)

## 🔧 Technical Implementation

### File Upload Flow
1. User picks file using `documentPickerUtils.pickDocument()`
2. File uploaded to Cloudinary via `uploadService.uploadDocument()`
3. Cloudinary returns secure URL
4. URL stored in content document
5. Download uses Cloudinary's direct link

### Purchase Flow
1. User initiates purchase
2. Check if already purchased
3. For free content: Direct grant access
4. For paid content:
   - Check wallet balance
   - Deduct amount from wallet
   - Create purchase record
   - Grant download access
   - Update creator earnings

### Revenue Share
- Platform: 30%
- Creator: 70%
- Calculated on each purchase
- Tracked in creator earnings

## 📊 Analytics Tracked
- Content views
- Purchase count
- Download count
- Review ratings
- Creator earnings
- User engagement

## ✅ Testing Checklist

### Selling Flow
- [ ] Upload PDF content with all fields
- [ ] Upload with thumbnail
- [ ] Upload without thumbnail
- [ ] View uploaded content in My Uploads
- [ ] Check earnings calculation
- [ ] Verify content appears in Marketplace

### Buying Flow
- [ ] Browse marketplace content
- [ ] Search for specific content
- [ ] Filter by content type
- [ ] View content details
- [ ] Purchase free content
- [ ] Purchase paid content (sufficient balance)
- [ ] Purchase paid content (insufficient balance)
- [ ] View purchased content in My Purchases
- [ ] Download purchased content
- [ ] Add review to purchased content

### Edge Cases
- [ ] Multiple simultaneous purchases
- [ ] Duplicate purchase prevention
- [ ] Network failure during upload
- [ ] Large file uploads
- [ ] Invalid file types
- [ ] Price = 0 (free content)
- [ ] Wallet recharge flow integration

## 🚀 Future Enhancements
- Bundle purchases (multiple content at discount)
- Creator verification badges
- Content preview/sample pages
- Wishlists
- Gift content to others
- Promotional discounts
- Referral rewards on purchases
- Content recommendations
- Advanced analytics for creators
- Bulk uploads
- Content versioning/updates

## 📞 Support
For issues or questions about the Marketplace feature, contact the development team or check the main project documentation.

---

**Version**: 1.0  
**Last Updated**: January 28, 2026  
**Status**: Production Ready ✅
