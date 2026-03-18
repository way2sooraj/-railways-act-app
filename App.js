import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ScrollView, Platform, StatusBar, Keyboard } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Merriweather_400Regular, Merriweather_700Bold, useFonts as useMerriweatherFonts } from '@expo-google-fonts/merriweather';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { CHAPTERS, ACT_METADATA } from './Data';

const C = {
  text: "#1A2744",
  textSecondary: "#5C6E8A",
  textMuted: "#8A9AB5",
  background: "#F8F6F1",
  backgroundSecondary: "#EEEAE2",
  backgroundCard: "#FFFFFF",
  tint: "#C0392B",
  accent: "#D4A017",
  navy: "#1A2744",
  border: "#DDD8CF",
  badgeBg: "#FDECEA",
  searchBg: "#F0EDE6",
};

// ─── Bookmarks Context ───────────────────────────────────────────────
const BookmarksContext = createContext({
  bookmarks: [],
  toggleBookmark: () => {},
  removeBookmark: () => {},
  isBookmarked: () => false,
});

function BookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);

  const toggleBookmark = useCallback((item) => {
    setBookmarks(prev =>
      prev.find(b => b.id === item.id)
        ? prev.filter(b => b.id !== item.id)
        : [...prev, { ...item, addedAt: Date.now() }]
    );
  }, []);

  const removeBookmark = useCallback((id) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const isBookmarked = useCallback((id) => bookmarks.some(b => b.id === id), [bookmarks]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, toggleBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

const useBookmarks = () => useContext(BookmarksContext);

// ─── Home Screen ─────────────────────────────────────────────────────
function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { bookmarks } = useBookmarks();

  const listData = [
    { type: 'header' },
    { type: 'stats' },
    { type: 'actions' },
    { type: 'divider', title: 'Table of Contents' },
    ...CHAPTERS.map((chapter, index) => ({ type: 'chapter', chapter, index })),
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <LinearGradient colors={[C.navy, "#223060"]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>GOI</Text>
          </View>
          <Text style={styles.headerTitle}>The Railways Act</Text>
          <Text style={styles.headerSubtitle}>1989 · Act No. 24</Text>
          <Text style={styles.headerDesc}>{ACT_METADATA.description}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={11} color="rgba(255,255,255,0.6)" />
              <Text style={styles.metaText}>Enacted {ACT_METADATA.enacted}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Feather name="check-circle" size={11} color="rgba(255,255,255,0.6)" />
              <Text style={styles.metaText}>In force {ACT_METADATA.enforced}</Text>
            </View>
          </View>
        </LinearGradient>
      );
    }
    if (item.type === 'stats') {
      return (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{ACT_METADATA.totalChapters}</Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{ACT_METADATA.totalSections}</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{ACT_METADATA.lastAmended}</Text>
            <Text style={styles.statLabel}>Last Amended</Text>
          </View>
        </View>
      );
    }
    if (item.type === 'actions') {
      return (
        <View style={styles.actionBar}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Search')}
          >
            <Feather name="search" size={16} color={C.tint} />
            <Text style={styles.actionBtnText}>Search Act</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtnSecondary, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <Feather name="bookmark" size={16} color={bookmarks.length > 0 ? C.accent : C.textMuted} />
            {bookmarks.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{bookmarks.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      );
    }
    if (item.type === 'divider') {
      return (
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionDividerText}>{item.title}</Text>
        </View>
      );
    }
    if (item.type === 'chapter') {
      return (
        <Pressable
          style={({ pressed }) => [styles.chapterCard, pressed && styles.chapterCardPressed]}
          onPress={() => navigation.navigate('Chapter', { chapter: item.chapter })}
        >
          <View style={styles.chapterNumberBadge}>
            <Text style={styles.chapterNumberText}>{item.chapter.number}</Text>
          </View>
          <View style={styles.chapterContent}>
            <Text style={styles.chapterLabel}>Chapter {item.chapter.number}</Text>
            <Text style={styles.chapterTitle} numberOfLines={2}>{item.chapter.title}</Text>
            <View style={styles.chapterFooter}>
              <Feather name="file-text" size={11} color={C.textMuted} />
              <Text style={styles.chapterSections}>
                {item.chapter.sections.length} section{item.chapter.sections.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={C.textMuted} />
        </Pressable>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} translucent={Platform.OS === 'android'} />
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'chapter' ? `chapter-${item.chapter.number}` : `${item.type}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      />
    </View>
  );
}

// ─── Chapter Screen ───────────────────────────────────────────────────
function ChapterScreen({ route, navigation }) {
  const { chapter } = route.params;
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const listData = [
    { type: 'header' },
    { type: 'label' },
    ...chapter.sections.map(section => ({ type: 'section', section })),
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <LinearGradient colors={[C.navy, "#223060"]} style={[styles.chapterHeader, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={styles.chapterNumWrap}>
            <Text style={styles.chapterNumLabel}>Chapter</Text>
            <Text style={styles.chapterNum}>{chapter.number}</Text>
          </View>
          <Text style={styles.chapterTitleText}>{chapter.title}</Text>
          <View style={styles.sectionCountRow}>
            <Feather name="file-text" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.sectionCount}>
              {chapter.sections.length} Section{chapter.sections.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </LinearGradient>
      );
    }
    if (item.type === 'label') {
      return (
        <View style={styles.sectionsLabelWrap}>
          <Text style={styles.sectionsLabelText}>Sections</Text>
        </View>
      );
    }
    const section = item.section;
    const sectionId = `${chapter.number}-${section.number}`;
    const bookmarked = isBookmarked(sectionId);
    const preview = section.content.substring(0, 90).replace(/\n/g, ' ') + '...';
    return (
      <Pressable
        style={({ pressed }) => [styles.sectionCard, pressed && styles.sectionCardPressed]}
        onPress={() => navigation.navigate('Section', { section, chapter })}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumberContainer}>
            <Text style={styles.sectionNumberLabel}>§</Text>
            <Text style={styles.sectionNumberText}>{section.number}</Text>
          </View>
          <Pressable
            onPress={() => toggleBookmark({
              id: sectionId,
              chapterNumber: chapter.number,
              chapterTitle: chapter.title,
              sectionNumber: section.number,
              sectionTitle: section.title,
            })}
            hitSlop={12}
          >
            <Feather name="bookmark" size={18} color={bookmarked ? C.accent : C.textMuted} />
          </Pressable>
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionPreview} numberOfLines={2}>{preview}</Text>
        <View style={styles.readMoreRow}>
          <Text style={styles.readMore}>Read full section</Text>
          <Feather name="arrow-right" size={12} color={C.tint} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} translucent={Platform.OS === 'android'} />
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'section' ? `section-${item.section.number}` : `${item.type}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      />
    </View>
  );
}

// ─── Section Screen ───────────────────────────────────────────────────
function SectionScreen({ route, navigation }) {
  const { section, chapter } = route.params;
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const sectionId = `${chapter.number}-${section.number}`;
  const bookmarked = isBookmarked(sectionId);
  const paragraphs = section.content.split('\n\n').filter(Boolean);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} translucent={Platform.OS === 'android'} />
      <LinearGradient
        colors={[C.navy, "#223060"]}
        style={[styles.sectionScreenHeader, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.bookmarkBtn, bookmarked && styles.bookmarkBtnActive]}
            onPress={() => toggleBookmark({
              id: sectionId,
              chapterNumber: chapter.number,
              chapterTitle: chapter.title,
              sectionNumber: section.number,
              sectionTitle: section.title,
            })}
          >
            <Feather name="bookmark" size={18} color={bookmarked ? C.navy : '#fff'} />
          </Pressable>
        </View>
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Chapter {chapter.number}</Text>
          <Feather name="chevron-right" size={11} color="rgba(255,255,255,0.4)" />
          <Text style={styles.breadcrumbCurrent}>Section {section.number}</Text>
        </View>
        <Text style={styles.sectionScreenTitle}>{section.title}</Text>
        <View style={styles.sectionScreenBadge}>
          <Text style={styles.sectionScreenBadgeText}>§ {section.number}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          {paragraphs.map((para, index) => {
            const isNumberedList = /^\(\d+\)/.test(para.trim());
            return (
              <View key={index} style={styles.paragraph}>
                <Text style={[styles.paragraphText, isNumberedList && styles.listItem]}>
                  {para.trim()}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Feather name="book-open" size={14} color={C.textMuted} />
            <Text style={styles.metaLabel}>Chapter</Text>
            <Text style={styles.metaValue}>{chapter.number} — {chapter.title}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Feather name="file-text" size={14} color={C.textMuted} />
            <Text style={styles.metaLabel}>Section</Text>
            <Text style={styles.metaValue}>{section.number}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Feather name="layers" size={14} color={C.textMuted} />
            <Text style={styles.metaLabel}>Act</Text>
            <Text style={styles.metaValue}>The Railways Act, 1989</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={16} color={C.tint} />
          <Text style={styles.navBtnText}>Back to Chapter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Search Screen ────────────────────────────────────────────────────
function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const found = [];
    for (const chapter of CHAPTERS) {
      for (const section of chapter.sections) {
        const titleMatch = section.title.toLowerCase().includes(q);
        const contentMatch = section.content.toLowerCase().includes(q);
        if (titleMatch) {
          found.push({ chapter, section, matchType: 'title' });
        } else if (contentMatch) {
          found.push({ chapter, section, matchType: 'content' });
        }
      }
    }
    return found;
  }, [query]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.backgroundCard} translucent={Platform.OS === 'android'} />
      <View style={[styles.searchScreenHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.searchRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtnLight}>
            <Feather name="arrow-left" size={20} color={C.text} />
          </Pressable>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={C.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search sections, topics..."
              placeholderTextColor={C.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        {query.length >= 2 && (
          <Text style={styles.resultCount}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </Text>
        )}
      </View>

      {query.length < 2 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="search" size={36} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Search the Act</Text>
          <Text style={styles.emptyDesc}>Search for any section title, topic, or keyword across all chapters</Text>
          <View style={styles.suggestions}>
            {['accident', 'penalty', 'passenger', 'compensation', 'ticket'].map(term => (
              <Pressable key={term} style={styles.suggestionChip} onPress={() => setQuery(term)}>
                <Text style={styles.suggestionText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="inbox" size={36} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyDesc}>Try different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => `${item.chapter.number}-${item.section.number}`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate('Section', { section: item.section, chapter: item.chapter });
              }}
            >
              <View style={styles.resultHeader}>
                <View style={styles.sectionNumberContainer}>
                  <Text style={styles.sectionNumberLabel}>§</Text>
                  <Text style={styles.sectionNumberText}>{item.section.number}</Text>
                </View>
                <Text style={styles.resultChapterLabel} numberOfLines={1}>
                  Chapter {item.chapter.number} · {item.chapter.title}
                </Text>
              </View>
              <Text style={styles.sectionTitle} numberOfLines={2}>{item.section.title}</Text>
              <Text style={styles.sectionPreview} numberOfLines={3}>
                {item.section.content.substring(0, 120)}...
              </Text>
              <View style={styles.readMoreRow}>
                <Text style={[styles.readMore, { fontStyle: 'italic' }]}>
                  {item.matchType === 'title' ? 'Title match' : 'Content match'}
                </Text>
                <Feather name="arrow-right" size={12} color={C.tint} />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

// ─── Bookmarks Screen ─────────────────────────────────────────────────
function BookmarksScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { bookmarks, removeBookmark } = useBookmarks();
  const sortedBookmarks = [...bookmarks].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} translucent={Platform.OS === 'android'} />
      <LinearGradient
        colors={[C.navy, "#223060"]}
        style={[styles.chapterHeader, { paddingTop: insets.top + 8 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.chapterTitleText}>Saved Sections</Text>
        <Text style={styles.sectionCount}>
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="bookmark" size={40} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyDesc}>
            Tap the bookmark icon on any section to save it for quick access
          </Text>
          <Pressable
            style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseBtnText}>Browse the Act</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sortedBookmarks}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            <Text style={styles.listHeader}>Recently saved</Text>
          }
          renderItem={({ item }) => {
            const chapter = CHAPTERS.find(c => c.number === item.chapterNumber);
            const section = chapter?.sections.find(s => s.number === item.sectionNumber);
            const addedDate = new Date(item.addedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            });
            return (
              <Pressable
                style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}
                onPress={() => {
                  if (chapter && section) navigation.navigate('Section', { section, chapter });
                }}
              >
                <View style={styles.bookmarkHeader}>
                  <View style={styles.bookmarkBadge}>
                    <Feather name="bookmark" size={12} color={C.accent} />
                    <Text style={styles.bookmarkBadgeText}>Saved</Text>
                  </View>
                  <Pressable onPress={() => removeBookmark(item.id)} hitSlop={12}>
                    <Feather name="trash-2" size={15} color={C.textMuted} />
                  </Pressable>
                </View>
                <Text style={styles.bookmarkSection}>
                  § {item.sectionNumber} · Chapter {item.chapterNumber}
                </Text>
                <Text style={styles.sectionTitle} numberOfLines={2}>{item.sectionTitle}</Text>
                <View style={styles.bookmarkFooter}>
                  <Text style={styles.resultChapterLabel} numberOfLines={1}>{item.chapterTitle}</Text>
                  <Text style={styles.dateText}>{addedDate}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();

export default function App() {
  const [interLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [merriweatherLoaded] = useMerriweatherFonts({
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  if (!interLoaded || !merriweatherLoaded) return null;

  return (
    <SafeAreaProvider>
      <BookmarksProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Chapter" component={ChapterScreen} />
            <Stack.Screen name="Section" component={SectionScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </BookmarksProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },

  // Home header
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  headerBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerBadgeText: { fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.9)', fontSize: 10, letterSpacing: 2 },
  headerTitle: { fontFamily: 'Merriweather_700Bold', fontSize: 26, color: '#FFFFFF', textAlign: 'center', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 12, letterSpacing: 0.5 },
  headerDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, marginBottom: 16, paddingHorizontal: 12, fontStyle: 'italic' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Stats
  statsBar: { flexDirection: 'row', backgroundColor: C.backgroundCard, marginHorizontal: 16, marginTop: -1, borderRadius: 12, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontFamily: 'Merriweather_700Bold', fontSize: 20, color: C.navy, marginBottom: 2, textAlign: 'center' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.textMuted, letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // Action bar
  actionBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.backgroundCard, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: C.tint },
  actionBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.tint },
  actionBtnSecondary: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: C.backgroundCard, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: C.accent, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: C.navy },

  // TOC divider
  sectionDivider: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  sectionDividerText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },

  // Chapter card (home)
  chapterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.backgroundCard, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, gap: 12 },
  chapterCardPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  chapterNumberBadge: { width: 40, height: 40, backgroundColor: C.navy, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chapterNumberText: { fontFamily: 'Merriweather_700Bold', color: '#FFFFFF', fontSize: 13 },
  chapterContent: { flex: 1 },
  chapterLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: C.tint, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  chapterTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.text, lineHeight: 21, marginBottom: 5 },
  chapterFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chapterSections: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.textMuted },

  // Chapter screen header
  chapterHeader: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  chapterNumWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  chapterNumLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' },
  chapterNum: { fontFamily: 'Merriweather_700Bold', fontSize: 22, color: C.accent },
  chapterTitleText: { fontFamily: 'Merriweather_700Bold', fontSize: 22, color: '#FFFFFF', lineHeight: 32, marginBottom: 10 },
  sectionCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionCount: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  sectionsLabelWrap: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  sectionsLabelText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase' },

  // Section card
  sectionCard: { backgroundColor: C.backgroundCard, marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sectionCardPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionNumberContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 3, backgroundColor: C.badgeBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sectionNumberLabel: { fontFamily: 'Merriweather_700Bold', fontSize: 13, color: C.tint },
  sectionNumberText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: C.tint },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: C.text, lineHeight: 22, marginBottom: 8 },
  sectionPreview: { fontFamily: 'Inter_400Regular', fontSize: 13, color: C.textSecondary, lineHeight: 20, marginBottom: 10 },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMore: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.tint },

  // Section screen
  sectionScreenHeader: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  bookmarkBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  bookmarkBtnActive: { backgroundColor: C.accent },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  breadcrumbText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  breadcrumbCurrent: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  sectionScreenTitle: { fontFamily: 'Merriweather_700Bold', fontSize: 20, color: '#FFFFFF', lineHeight: 30, marginBottom: 12 },
  sectionScreenBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(192,57,43,0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sectionScreenBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FFFFFF', letterSpacing: 0.5 },
  scrollContent: { padding: 16, gap: 14 },
  contentCard: { backgroundColor: C.backgroundCard, borderRadius: 14, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, gap: 14 },
  paragraph: {},
  paragraphText: { fontFamily: 'Merriweather_400Regular', fontSize: 15, color: C.text, lineHeight: 26, letterSpacing: 0.1 },
  listItem: { borderLeftWidth: 3, borderLeftColor: C.border, paddingLeft: 12, marginLeft: 4 },
  metaCard: { backgroundColor: C.backgroundCard, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2 },
  metaLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.textMuted, width: 56, marginTop: 1 },
  metaValue: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.text, flex: 1, lineHeight: 18 },
  metaDivider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: C.tint, borderRadius: 10, paddingVertical: 12, backgroundColor: C.backgroundCard },
  navBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: C.tint },

  // Search screen
  searchScreenHeader: { backgroundColor: C.backgroundCard, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtnLight: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: C.backgroundSecondary },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.searchBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: C.border },
  searchInput: { fontFamily: 'Inter_400Regular', flex: 1, fontSize: 15, color: C.text, padding: 0, margin: 0 },
  resultCount: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.textMuted },
  resultCard: { backgroundColor: C.backgroundCard, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' },
  resultChapterLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.textMuted, flex: 1 },

  // Empty states
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyIcon: { width: 72, height: 72, backgroundColor: C.backgroundSecondary, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: C.text },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 21 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  suggestionChip: { backgroundColor: C.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  suggestionText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: C.textSecondary },

  // Bookmarks screen
  listHeader: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  bookmarkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookmarkBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  bookmarkBadgeText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.accent },
  bookmarkSection: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.tint, letterSpacing: 0.3, marginBottom: 4 },
  bookmarkFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.textMuted },
  browseBtn: { marginTop: 8, backgroundColor: C.tint, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  browseBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' },
});
