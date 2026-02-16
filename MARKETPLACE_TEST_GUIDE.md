# 🚀 Marketplace Quick Test Guide

## Prerequisites
- Backend server running on configured port
- React Native app installed on device/emulator
- User account created and logged in
- Wallet with some balance for testing purchases

## 🧪 Step-by-Step Testing

### Part 1: Selling Content (Upload Flow) 📤

1. **Navigate to Marketplace**
   - Open app
   - Tap on "Marketplace" tab (bottom navigation)

2. **Start Upload**
   - Tap "Sell" button (top right, purple button)
   - You'll be redirected to Upload Content Screen

3. **Fill Content Details**
   - Select Content Type: **PDF Notes** (default selected)
   - Title: "UPSC Prelims History Notes 2024"
   - Description: "Comprehensive history notes covering ancient, medieval, and modern India"
   - Price: "299"
   - Category: Select "Notes"
   - Exams: Select "UPSC" (tap to toggle)
   - Tags: "history, prelims, upsc"

4. **Upload Files**
   - Tap "Choose PDF File" button
   - Select a PDF from your device
   - Wait for upload (you'll see "Uploading..." → "File uploaded to cloud" ✅)
   - Optionally: Tap "Choose Image" for thumbnail
   - Select an image and wait for upload

5. **Submit**
   - Tap "Upload Content" button
   - Wait for success message
   - You'll be redirected back to Marketplace

### Part 2: View Your Uploads 📊

1. **Open My Uploads**
   - From Marketplace screen
   - Tap package icon (📦) in header
   
2. **Verify Upload**
   - Check summary cards at top:
     - Total Items: 1 (or more)
     - Total Sales: 0 (initially)
     - Total Earnings: ₹0 (initially)
   - See your uploaded content in the list
   - Verify thumbnail, title, price, stats

3. **View Details**
   - Tap on your uploaded content card
   - Check all details are correct
   - Note: You cannot purchase your own content

### Part 3: Buying Content (Purchase Flow) 🛒

#### Test Free Content Purchase

1. **Browse Marketplace**
   - Go back to Marketplace screen
   - Look for FREE content
   - OR use search: search for free content

2. **View Content Details**
   - Tap on any FREE content card
   - Review details, ratings, creator info
   - Check the "Get Free" button at bottom

3. **Get Free Content**
   - Tap "Get Free" button
   - Confirm in dialog
   - Success message appears
   - Button changes to "Download" (green)

4. **Download**
   - Tap "Download" button
   - Content opens in browser/downloads

#### Test Paid Content Purchase

1. **Browse Paid Content**
   - Look for content with ₹ price
   - Example: Your own uploaded content (if uploaded by another user)

2. **Check Wallet Balance**
   - Ensure wallet has sufficient balance
   - If not: Navigate to Wallet → Recharge

3. **View Content Details**
   - Tap on paid content card
   - Review all details
   - Check price at bottom

4. **Purchase**
   - Tap "Buy Now" button
   - Confirm purchase dialog appears
   - Tap "Purchase" to confirm
   - Amount deducted from wallet
   - Success message: "Content purchased successfully! 🎉"
   - Button changes to "Download"

5. **Download Purchased Content**
   - Tap "Download" button
   - Opens download link
   - OR Navigate to My Purchases screen

#### Test Insufficient Balance Scenario

1. **Empty Wallet** (for testing)
   - Ensure wallet balance < content price

2. **Try to Purchase**
   - Tap "Buy Now" on expensive content
   - Confirm purchase
   - Error: "Insufficient Balance"
   - Alert with "Recharge Wallet" option

3. **Recharge**
   - Tap "Recharge Wallet" button
   - Redirected to Wallet screen
   - Add coins
   - Go back and complete purchase

### Part 4: My Purchases Screen 📥

1. **Navigate to My Purchases**
   - From ContentDetailsScreen after purchase, tap "View Downloads"
   - OR Navigate from profile/menu

2. **Verify Purchases**
   - See all purchased content
   - Check purchase date
   - Check download count
   - Check price paid

3. **Download from My Purchases**
   - Tap "Download" on any purchase
   - Content link opens
   - Download count increments

### Part 5: Search & Filters 🔍

1. **Search Test**
   - Marketplace screen
   - Tap search bar
   - Type: "UPSC"
   - Results filter in real-time
   - Tap X icon to clear search

2. **Content Type Filters**
   - Tap "PDF" filter chip
   - Only PDF content shows
   - Tap "Video" filter
   - Only videos show
   - Tap "All" to show everything

### Part 6: Edge Cases 🧪

1. **Already Purchased Content**
   - Try to view content you already purchased
   - Button should show "Download" (not "Buy Now")
   - Tap shows download, not purchase flow

2. **Pull to Refresh**
   - In My Uploads screen
   - In My Purchases screen
   - Pull down to refresh data

3. **Empty States**
   - New user with no uploads → My Uploads empty state
   - New user with no purchases → My Purchases empty state
   - No search results → Empty state

## ✅ Success Criteria

After testing, verify:
- [ ] Can upload PDF content successfully
- [ ] Files upload to Cloudinary
- [ ] Content appears in Marketplace
- [ ] Content appears in My Uploads
- [ ] Can purchase free content
- [ ] Can purchase paid content (with balance)
- [ ] Insufficient balance handled correctly
- [ ] Downloaded content accessible
- [ ] My Purchases shows all purchases
- [ ] Search works correctly
- [ ] Filters work correctly
- [ ] Earnings calculated correctly in My Uploads
- [ ] All navigation flows work
- [ ] Error messages are clear
- [ ] Loading states shown appropriately

## 🐛 Common Issues & Solutions

### Issue: File upload fails
**Solution**: 
- Check Cloudinary configuration in backend
- Verify file size limits
- Check internet connection

### Issue: Purchase fails
**Solution**:
- Check wallet balance
- Verify backend is running
- Check API endpoints

### Issue: Download doesn't work
**Solution**:
- Check if purchase was successful
- Verify download links haven't expired
- Check browser permissions

### Issue: Content not appearing
**Solution**:
- Pull to refresh
- Check content approval status (if admin approval required)
- Verify API responses in console

## 📝 Test Data Suggestions

### Sample Content for Upload
```
Title: "UPSC Prelims Mock Test - 2024"
Description: "100 questions covering GS Paper 1 with detailed explanations"
Price: 199
Category: Mock Tests
Exams: UPSC
Tags: prelims, mock test, gs paper 1

Title: "SSC CGL Quantitative Aptitude Notes"
Description: "Complete notes with formulas and shortcuts"
Price: 149
Category: Notes
Exams: SSC
Tags: quantitative, aptitude, shortcuts
```

### Sample Searches
- "UPSC"
- "SSC"
- "prelims"
- "notes"
- "mock test"

## 📊 Metrics to Monitor

During testing, observe:
- Upload success rate
- Purchase success rate
- Download success rate
- Error frequency
- Loading times
- UI responsiveness

## 🎯 Next Steps

After successful testing:
1. ✅ Mark all checklist items
2. 📸 Take screenshots of key screens
3. 📝 Document any bugs found
4. 🚀 Deploy to production
5. 👥 Enable for users

---

**Happy Testing! 🎉**
