import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import CustomIcon from '../../components/CustomIcon';
import {COLORS} from '../../constants/colors';
import {APP_CONFIG} from '../../constants/config';
import {useSelector} from 'react-redux';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type ViewMode = 'light' | 'dark' | 'sepia';

const PDFViewerScreen = ({route, navigation}: any) => {
  const {url, title, contentId} = route.params;
  const currentUser = useSelector((state: any) => state.auth.user);

  // PDF state
  const pdfRef = useRef<any>(null);
  const pageRef = useRef(1);
  const pageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Feature states
  const [viewMode, setViewMode] = useState<ViewMode>('light');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showPageJump, setShowPageJump] = useState(false);
  const [pageJumpText, setPageJumpText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [horizontalMode, setHorizontalMode] = useState(false);
  const [fitPolicy, setFitPolicy] = useState<0 | 1 | 2>(0); // 0 = fit width, 1 = fit height, 2 = fit both
  const [keepAwake, setKeepAwake] = useState(true);

  // Storage keys
  const storageKey = `pdf_progress_${contentId || url}`;
  const bookmarkKey = `pdf_bookmarks_${contentId || url}`;

  // Download PDF to local cache and load saved state
  useEffect(() => {
    downloadPdf();
    loadSavedState();
    return () => {
      saveProgress();
    };
  }, []);

  const downloadPdf = async () => {
    try {
      // Create a cache-friendly filename from URL
      const fileName = contentId || url.split('/').pop() || 'document.pdf';
      const cacheDir = ReactNativeBlobUtil.fs.dirs.CacheDir;
      const filePath = `${cacheDir}/pdf_cache_${fileName}`;

      // Check if already cached
      const exists = await ReactNativeBlobUtil.fs.exists(filePath);
      if (exists) {
        const stat = await ReactNativeBlobUtil.fs.stat(filePath);
        if (Number(stat.size) > 100) {
          console.log('📄 [PDFViewer] Using cached file:', filePath, 'size:', stat.size);
          setLocalFilePath(Platform.OS === 'android' ? `file://${filePath}` : filePath);
          return;
        }
        // Delete corrupted/empty cached file
        await ReactNativeBlobUtil.fs.unlink(filePath);
      }

      // Build full URL: prepend API base URL if path is relative (stream proxy)
      const fullUrl = url.startsWith('/') ? `${APP_CONFIG.API_BASE_URL}${url}` : url;
      console.log('📄 [PDFViewer] Downloading PDF via fetch from:', fullUrl);

      // Get auth token for protected stream endpoints
      const token = await AsyncStorage.getItem('authToken');
      const headers: Record<string, string> = {'Accept': 'application/pdf,*/*'};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('📄 [PDFViewer] Fetched blob size:', blob.size);

      if (blob.size < 100) {
        console.error('❌ [PDFViewer] Downloaded file too small:', blob.size);
        setLoading(false);
        setError(true);
        return;
      }

      // Convert blob to base64 and write to cache
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Write base64 data to local file using blob-util (no network = no SSL issue)
      await ReactNativeBlobUtil.fs.writeFile(filePath, base64Data, 'base64');

      const stat = await ReactNativeBlobUtil.fs.stat(filePath);
      console.log('📄 [PDFViewer] Saved to:', filePath, 'size:', stat.size);

      setDownloadProgress(1);
      setLocalFilePath(Platform.OS === 'android' ? `file://${filePath}` : filePath);
    } catch (err) {
      console.error('❌ [PDFViewer] Download failed:', err);
      setLoading(false);
      setError(true);
    }
  };

  const loadSavedState = async () => {
    try {
      const [savedPage, savedBookmarks] = await Promise.all([
        AsyncStorage.getItem(storageKey),
        AsyncStorage.getItem(bookmarkKey),
      ]);
      if (savedPage) {
        const page = parseInt(savedPage, 10);
        if (page > 0) {
          pageRef.current = page;
          setCurrentPage(page);
        }
      }
      if (savedBookmarks) {
        setBookmarkedPages(JSON.parse(savedBookmarks));
      }
    } catch (e) {
      console.log('Failed to load PDF state:', e);
    }
  };

  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem(storageKey, currentPage.toString());
    } catch (e) {
      console.log('Failed to save progress:', e);
    }
  };

  const saveBookmarks = async (bookmarks: number[]) => {
    try {
      await AsyncStorage.setItem(bookmarkKey, JSON.stringify(bookmarks));
    } catch (e) {
      console.log('Failed to save bookmarks:', e);
    }
  };

  // Save progress when page changes (debounced to avoid excessive writes)
  useEffect(() => {
    if (currentPage > 0 && totalPages > 0) {
      if (pageDebounceRef.current) clearTimeout(pageDebounceRef.current);
      pageDebounceRef.current = setTimeout(() => {
        saveProgress();
      }, 500);
    }
    return () => {
      if (pageDebounceRef.current) clearTimeout(pageDebounceRef.current);
    };
  }, [currentPage]);

  const toggleBookmark = useCallback(() => {
    setBookmarkedPages(prev => {
      const isBookmarked = prev.includes(currentPage);
      const updated = isBookmarked
        ? prev.filter(p => p !== currentPage)
        : [...prev, currentPage].sort((a, b) => a - b);
      saveBookmarks(updated);
      return updated;
    });
  }, [currentPage]);

  const jumpToPage = useCallback(() => {
    const page = parseInt(pageJumpText, 10);
    if (page >= 1 && page <= totalPages && pdfRef.current) {
      pdfRef.current.setPage(page);
      setShowPageJump(false);
      setPageJumpText('');
    }
  }, [pageJumpText, totalPages]);

  const goToPage = useCallback((page: number) => {
    if (pdfRef.current) {
      pdfRef.current.setPage(page);
    }
    setShowBookmarks(false);
    setShowThumbnails(false);
  }, []);

  const cycleViewMode = useCallback(() => {
    setViewMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'sepia';
      return 'light';
    });
  }, []);

  const getViewModeStyles = () => {
    switch (viewMode) {
      case 'dark':
        return {
          bg: '#1A1A2E',
          headerBg: '#16213E',
          text: '#E0E0E0',
          subText: '#9CA3AF',
          border: '#2D3748',
          cardBg: '#1E293B',
          overlay: 'rgba(26, 26, 46, 0.95)',
        };
      case 'sepia':
        return {
          bg: '#F5E6CA',
          headerBg: '#E8D5B5',
          text: '#5B4636',
          subText: '#8B7355',
          border: '#D4C4A8',
          cardBg: '#EDE0C8',
          overlay: 'rgba(245, 230, 202, 0.95)',
        };
      default:
        return {
          bg: '#FFFFFF',
          headerBg: '#FFFFFF',
          text: '#1F2937',
          subText: '#6B7280',
          border: '#E5E7EB',
          cardBg: '#F9FAFB',
          overlay: 'rgba(255, 255, 255, 0.95)',
        };
    }
  };

  const theme = getViewModeStyles();
  const isBookmarked = bookmarkedPages.includes(currentPage);
  const progressPercent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  // Watermark text
  const watermarkText = currentUser?.name || currentUser?.phone || 'User';

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'dark': return 'weather-night';
      case 'sepia': return 'coffee';
      default: return 'white-balance-sunny';
    }
  };

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'dark': return 'Dark';
      case 'sepia': return 'Sepia';
      default: return 'Light';
    }
  };

  // Render watermark overlay
  const renderWatermark = () => (
    <View style={styles.watermarkContainer} pointerEvents="none">
      {[0.15, 0.45, 0.75].map((top, i) => (
        <Text
          key={i}
          style={[
            styles.watermarkText,
            {
              top: `${top * 100}%` as any,
              opacity: 0.06,
              transform: [{rotate: '-30deg'}],
            },
          ]}>
          {watermarkText}
        </Text>
      ))}
    </View>
  );

  // Render header
  const renderHeader = () => {
    if (isFullScreen) return null;

    return (
      <View style={[styles.header, {backgroundColor: theme.headerBg, borderBottomColor: theme.border}]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <CustomIcon name="arrow-left" size={22} color={theme.text} type="material-community" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, {color: theme.text}]} numberOfLines={1}>
            {title || 'PDF Viewer'}
          </Text>
          {totalPages > 0 && (
            <TouchableOpacity onPress={() => setShowPageJump(true)}>
              <Text style={[styles.pageInfo, {color: theme.subText}]}>
                Page {currentPage} of {totalPages}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSettings(!showSettings)}>
          <CustomIcon name="cog" size={22} color={theme.text} type="material-community" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    if (isFullScreen || totalPages === 0) return null;

    return (
      <View style={[styles.progressBarContainer, {backgroundColor: theme.border}]}>
        <View
          style={[styles.progressBarFill, {width: `${progressPercent}%`}]}
        />
      </View>
    );
  };

  // Render bottom toolbar
  const renderBottomToolbar = () => {
    if (isFullScreen) return null;

    return (
      <View style={[styles.bottomToolbar, {backgroundColor: theme.headerBg, borderTopColor: theme.border}]}>
        <TouchableOpacity style={styles.toolbarButton} onPress={toggleBookmark}>
          <CustomIcon
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked ? '#EF4444' : theme.subText}
            type="material-community"
          />
          <Text style={[styles.toolbarLabel, {color: theme.subText}]}>
            {isBookmarked ? 'Saved' : 'Bookmark'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => {
            setShowBookmarks(!showBookmarks);
            setShowThumbnails(false);
          }}>
          <CustomIcon name="bookmark-multiple" size={22} color={theme.subText} type="material-community" />
          <Text style={[styles.toolbarLabel, {color: theme.subText}]}>
            Bookmarks{bookmarkedPages.length > 0 ? ` (${bookmarkedPages.length})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => {
            setShowThumbnails(!showThumbnails);
            setShowBookmarks(false);
          }}>
          <CustomIcon name="view-grid" size={22} color={theme.subText} type="material-community" />
          <Text style={[styles.toolbarLabel, {color: theme.subText}]}>Pages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={cycleViewMode}>
          <CustomIcon name={getViewModeIcon()} size={22} color={theme.subText} type="material-community" />
          <Text style={[styles.toolbarLabel, {color: theme.subText}]}>{getViewModeLabel()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setIsFullScreen(true)}>
          <CustomIcon name="fullscreen" size={22} color={theme.subText} type="material-community" />
          <Text style={[styles.toolbarLabel, {color: theme.subText}]}>Focus</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render settings panel
  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <View style={[styles.settingsPanel, {backgroundColor: theme.cardBg, borderColor: theme.border}]}>
        <Text style={[styles.settingsSectionTitle, {color: theme.text}]}>Reading Settings</Text>

        {/* Brightness */}
        <View style={styles.settingsRow}>
          <CustomIcon name="brightness-5" size={18} color={theme.subText} type="material-community" />
          <Text style={[styles.settingsLabel, {color: theme.text}]}>Brightness</Text>
          <View style={styles.brightnessControls}>
            <TouchableOpacity
              onPress={() => setBrightness(Math.max(0.3, brightness - 0.1))}
              style={styles.brightnessButton}>
              <CustomIcon name="minus" size={16} color={theme.text} type="material-community" />
            </TouchableOpacity>
            <View style={styles.brightnessBarOuter}>
              <View style={[styles.brightnessBarInner, {width: `${brightness * 100}%`}]} />
            </View>
            <TouchableOpacity
              onPress={() => setBrightness(Math.min(1, brightness + 0.1))}
              style={styles.brightnessButton}>
              <CustomIcon name="plus" size={16} color={theme.text} type="material-community" />
            </TouchableOpacity>
          </View>
        </View>

        {/* View Mode */}
        <View style={styles.settingsRow}>
          <CustomIcon name="palette" size={18} color={theme.subText} type="material-community" />
          <Text style={[styles.settingsLabel, {color: theme.text}]}>Theme</Text>
          <View style={styles.viewModeButtons}>
            {(['light', 'dark', 'sepia'] as ViewMode[]).map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeBtn,
                  {
                    backgroundColor:
                      mode === 'light' ? '#FFF' : mode === 'dark' ? '#1A1A2E' : '#F5E6CA',
                    borderColor: viewMode === mode ? COLORS.primary : '#D1D5DB',
                    borderWidth: viewMode === mode ? 2 : 1,
                  },
                ]}
                onPress={() => setViewMode(mode)}>
                <Text
                  style={[
                    styles.viewModeBtnText,
                    {color: mode === 'dark' ? '#FFF' : '#333'},
                  ]}>
                  {mode === 'light' ? 'A' : mode === 'dark' ? 'A' : 'A'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scroll Direction */}
        <View style={styles.settingsRow}>
          <CustomIcon name="swap-horizontal" size={18} color={theme.subText} type="material-community" />
          <Text style={[styles.settingsLabel, {color: theme.text}]}>Scroll</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !horizontalMode && styles.toggleOptionActive,
              ]}
              onPress={() => setHorizontalMode(false)}>
              <Text style={[styles.toggleText, !horizontalMode && styles.toggleTextActive]}>
                Vertical
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                horizontalMode && styles.toggleOptionActive,
              ]}
              onPress={() => setHorizontalMode(true)}>
              <Text style={[styles.toggleText, horizontalMode && styles.toggleTextActive]}>
                Horizontal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fit Policy */}
        <View style={styles.settingsRow}>
          <CustomIcon name="fit-to-screen" size={18} color={theme.subText} type="material-community" />
          <Text style={[styles.settingsLabel, {color: theme.text}]}>Fit</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleOption, fitPolicy === 0 && styles.toggleOptionActive]}
              onPress={() => setFitPolicy(0)}>
              <Text style={[styles.toggleText, fitPolicy === 0 && styles.toggleTextActive]}>Width</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, fitPolicy === 2 && styles.toggleOptionActive]}
              onPress={() => setFitPolicy(2)}>
              <Text style={[styles.toggleText, fitPolicy === 2 && styles.toggleTextActive]}>Page</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeSettingsButton}
          onPress={() => setShowSettings(false)}>
          <Text style={{color: COLORS.primary, fontWeight: '600'}}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render page jump modal
  const renderPageJump = () => {
    if (!showPageJump) return null;

    return (
      <View style={styles.pageJumpOverlay}>
        <View style={[styles.pageJumpModal, {backgroundColor: theme.cardBg}]}>
          <Text style={[styles.pageJumpTitle, {color: theme.text}]}>Go to Page</Text>
          <TextInput
            style={[styles.pageJumpInput, {color: theme.text, borderColor: theme.border}]}
            keyboardType="number-pad"
            placeholder={`1 - ${totalPages}`}
            placeholderTextColor={theme.subText}
            value={pageJumpText}
            onChangeText={setPageJumpText}
            autoFocus
            onSubmitEditing={jumpToPage}
          />
          <View style={styles.pageJumpButtons}>
            <TouchableOpacity
              style={styles.pageJumpCancel}
              onPress={() => {
                setShowPageJump(false);
                setPageJumpText('');
              }}>
              <Text style={{color: theme.subText}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pageJumpGo} onPress={jumpToPage}>
              <Text style={{color: '#FFF', fontWeight: '600'}}>Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render bookmarks panel
  const renderBookmarksPanel = () => {
    if (!showBookmarks) return null;

    return (
      <View style={[styles.sidePanel, {backgroundColor: theme.overlay}]}>
        <View style={styles.sidePanelHeader}>
          <Text style={[styles.sidePanelTitle, {color: theme.text}]}>
            Bookmarks ({bookmarkedPages.length})
          </Text>
          <TouchableOpacity onPress={() => setShowBookmarks(false)}>
            <CustomIcon name="close" size={22} color={theme.subText} type="material-community" />
          </TouchableOpacity>
        </View>

        {bookmarkedPages.length === 0 ? (
          <View style={styles.emptyPanel}>
            <CustomIcon name="bookmark-outline" size={48} color={theme.border} type="material-community" />
            <Text style={[styles.emptyPanelText, {color: theme.subText}]}>
              No bookmarks yet
            </Text>
            <Text style={[styles.emptyPanelSubtext, {color: theme.subText}]}>
              Tap the bookmark icon to save pages
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarkedPages}
            keyExtractor={item => item.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.bookmarkItem,
                  {
                    backgroundColor: item === currentPage ? `${COLORS.primary}15` : 'transparent',
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => goToPage(item)}>
                <View style={styles.bookmarkItemLeft}>
                  <CustomIcon name="bookmark" size={18} color="#EF4444" type="material-community" />
                  <Text style={[styles.bookmarkItemText, {color: theme.text}]}>
                    Page {item}
                  </Text>
                </View>
                {item === currentPage && (
                  <Text style={styles.currentBadge}>Current</Text>
                )}
                <TouchableOpacity
                  onPress={() => {
                    const updated = bookmarkedPages.filter(p => p !== item);
                    setBookmarkedPages(updated);
                    saveBookmarks(updated);
                  }}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <CustomIcon name="close-circle" size={18} color={theme.subText} type="material-community" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  };

  // Render page thumbnails (grid)
  const renderThumbnailsPanel = () => {
    if (!showThumbnails || totalPages === 0) return null;

    const pages = Array.from({length: totalPages}, (_, i) => i + 1);

    return (
      <View style={[styles.sidePanel, {backgroundColor: theme.overlay}]}>
        <View style={styles.sidePanelHeader}>
          <Text style={[styles.sidePanelTitle, {color: theme.text}]}>
            All Pages ({totalPages})
          </Text>
          <TouchableOpacity onPress={() => setShowThumbnails(false)}>
            <CustomIcon name="close" size={22} color={theme.subText} type="material-community" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={pages}
          numColumns={4}
          keyExtractor={item => item.toString()}
          contentContainerStyle={styles.thumbnailGrid}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.thumbnailItem,
                {
                  borderColor: item === currentPage ? COLORS.primary : theme.border,
                  borderWidth: item === currentPage ? 2 : 1,
                  backgroundColor: theme.cardBg,
                },
              ]}
              onPress={() => goToPage(item)}>
              <Text
                style={[
                  styles.thumbnailPageNumber,
                  {color: item === currentPage ? COLORS.primary : theme.text},
                ]}>
                {item}
              </Text>
              {bookmarkedPages.includes(item) && (
                <View style={styles.thumbnailBookmark}>
                  <CustomIcon name="bookmark" size={12} color="#EF4444" type="material-community" />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Full screen tap to exit
  const renderFullScreenExit = () => {
    if (!isFullScreen) return null;

    return (
      <TouchableOpacity
        style={styles.fullScreenExitButton}
        onPress={() => setIsFullScreen(false)}>
        <CustomIcon name="fullscreen-exit" size={24} color="#FFF" type="material-community" />
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={[styles.container, {backgroundColor: theme.bg}]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <CustomIcon name="file-alert" size={64} color="#EF4444" type="material-community" />
          <Text style={[styles.errorText, {color: theme.subText}]}>Failed to load PDF</Text>
          <Text style={[styles.errorSubtext, {color: theme.subText}]}>
            Please check your internet connection and try again
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(false);
              setLoading(true);
              setLocalFilePath(null);
              downloadPdf();
            }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      <StatusBar
        barStyle={viewMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.headerBg}
      />

      {renderHeader()}
      {renderProgressBar()}

      {/* PDF View */}
      <View style={[styles.pdfContainer, {opacity: brightness}]}>
        {localFilePath ? (
          <Pdf
            ref={pdfRef}
            source={{uri: localFilePath}}
            style={[
              styles.pdf,
              {
                backgroundColor: theme.bg,
              },
            ]}
            horizontal={horizontalMode}
            enablePaging={horizontalMode}
            fitPolicy={fitPolicy}
            enableAntialiasing={true}
            enableAnnotationRendering={true}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              setLoading(false);
              // Resume from saved page after load
              if (pageRef.current > 1 && pdfRef.current) {
                pdfRef.current.setPage(pageRef.current);
              }
            }}
            onPageChanged={(page) => {
              pageRef.current = page;
              if (pageDebounceRef.current) clearTimeout(pageDebounceRef.current);
              pageDebounceRef.current = setTimeout(() => {
                setCurrentPage(page);
              }, 150);
            }}
            onError={(err) => {
              console.error('❌ [PDFViewer] Load error:', err);
              setLoading(false);
              setError(true);
            }}
            trustAllCerts={false}
          />
        ) : null}

        {/* Watermark overlay */}
        {renderWatermark()}
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={[styles.loadingOverlay, {backgroundColor: theme.overlay}]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, {color: theme.subText}]}>
            {!localFilePath
              ? `Downloading PDF... ${Math.round(downloadProgress * 100)}%`
              : 'Rendering PDF...'}
          </Text>
        </View>
      )}

      {renderBottomToolbar()}
      {renderSettings()}
      {renderPageJump()}
      {renderBookmarksPanel()}
      {renderThumbnailsPanel()}
      {renderFullScreenExit()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    maxWidth: SCREEN_WIDTH * 0.55,
  },
  pageInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  // Progress bar
  progressBarContainer: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  // PDF
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  // Watermark
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkText: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    width: SCREEN_WIDTH * 1.5,
    letterSpacing: 8,
  },
  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Bottom toolbar
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 56,
  },
  toolbarLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  // Settings panel
  settingsPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    right: 12,
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 100,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 70,
  },
  brightnessControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brightnessButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brightnessBarOuter: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  brightnessBarInner: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  viewModeButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  viewModeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  closeSettingsButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  // Page jump
  pageJumpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  pageJumpModal: {
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  pageJumpTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  pageJumpInput: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  pageJumpButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  pageJumpCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pageJumpGo: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  // Side panels
  sidePanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 300,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    zIndex: 150,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sidePanelTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyPanelText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyPanelSubtext: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  // Bookmark items
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  bookmarkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookmarkItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  currentBadge: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  // Thumbnails
  thumbnailGrid: {
    padding: 12,
  },
  thumbnailItem: {
    flex: 1,
    aspectRatio: 0.75,
    margin: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: (SCREEN_WIDTH * 0.75 - 40) / 4,
  },
  thumbnailPageNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  thumbnailBookmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  // Full screen
  fullScreenExitButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default PDFViewerScreen;
