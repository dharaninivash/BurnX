import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore, INDIAN_FOOD_DATABASE } from '../../store/useStore';
import { useTheme } from '../../theme/theme';
import { searchFoodMacros } from '../../services/nutritionScraper';
import BurnX3DFitnessWidget from '../../components/3d/BurnX3DFitnessWidget';
import AppleCard from '../../components/ui/AppleCard';

export default function Nutrition({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const user = useStore((state) => state.user) || { dietaryPreference: 'None' };
  
  // Local states
  const [searchQuery, setSearchQuery] = useState('');
  const [weightInput, setWeightInput] = useState('100');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMealCategory, setSelectedMealCategory] = useState('Breakfast');
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [activeFoodItem, setActiveFoodItem] = useState(null);
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

  // Zustand states & actions
  const calorieTarget = useStore((state) => state.calorieTarget) || 2000;
  const macroTarget = useStore((state) => state.macroTarget) || { protein: 120, carbs: 200, fats: 60 };
  const caloriesConsumed = useStore((state) => state.caloriesConsumed) || 0;
  const loggedFoods = useStore((state) => state.loggedFoods) || [];
  const addFood = useStore((state) => state.addFood);
  const removeFood = useStore((state) => state.removeFood);

  const waterIntake = useStore((state) => state.waterIntake) || 0;
  const waterIntakeGoal = useStore((state) => state.waterIntakeGoal) || 3000;
  const addWater = useStore((state) => state.addWater);

  const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  // Sum logged macros
  const proteinConsumed = loggedFoods.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const carbsConsumed = loggedFoods.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
  const fatsConsumed = loggedFoods.reduce((acc, curr) => acc + (curr.fats || 0), 0);

  // Search filter local handler
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Filter Indian food database
    const localFiltered = INDIAN_FOOD_DATABASE.filter(food =>
      food.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(localFiltered);
  };

  const handleSearchWeb = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingWeb(true);
    try {
      const weight = parseFloat(weightInput) || 100;
      const webResult = await searchFoodMacros(searchQuery, weight);
      
      // Inject standard properties
      const formattedWebItem = {
        id: 'web_' + Date.now(),
        name: webResult.name,
        calories: webResult.calories,
        protein: webResult.protein,
        carbs: webResult.carbs,
        fats: webResult.fats,
        portionSize: `${weight}g`,
        category: 'Web Database'
      };

      setSearchResults([formattedWebItem, ...searchResults]);
      Alert.alert('Web Search Match', `Found "${webResult.name}" in public registry!`);
    } catch (e) {
      Alert.alert('Search Failure', 'Unable to fetch public database offline. Used fallback estimates.');
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const triggerAddFoodFlow = (food) => {
    setActiveFoodItem(food);
    setLogModalVisible(true);
  };

  const logFoodItem = () => {
    if (!activeFoodItem) return;
    const weightGrams = parseFloat(weightInput) || 100;
    
    // Add to store
    addFood(activeFoodItem, weightGrams, selectedMealCategory);
    
    setLogModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    Alert.alert('Logged Success', `Added ${activeFoodItem.name} to your ${selectedMealCategory}!`);
  };

  const logCustomFood = () => {
    if (!customFood.name || !customFood.calories) {
      Alert.alert('Incomplete', 'Please provide at least a food name and calories.');
      return;
    }
    
    const foodObj = {
      id: 'custom_' + Date.now(),
      name: customFood.name,
      calories: parseInt(customFood.calories) || 0,
      protein: parseInt(customFood.protein) || 0,
      carbs: parseInt(customFood.carbs) || 0,
      fats: parseInt(customFood.fats) || 0,
      category: 'Custom Entry'
    };
    
    // We pass 100 for weight because the multiplier is (weight/100). This ensures the macros go in exactly as typed.
    addFood(foodObj, 100, selectedMealCategory);
    
    setCustomModalVisible(false);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    Alert.alert('Logged Success', `Added custom ${foodObj.name} to your ${selectedMealCategory}!`);
  };

  // Indian Food Smart Recommendations Engine based on dietaryPreference
  let recommendationTitle = 'High Protein Vegetarian Recommendations';
  let recommendedItems = [
    { name: 'Soya Chunks Curry', desc: '1 bowl offers 21g high-quality plant protein.' },
    { name: 'Paneer Bhurji / Tikka', desc: '150g serves 14g dense protein + fat macros.' },
    { name: 'Dal Tadka with Rice', desc: 'Classic complete amino-acid protein synthesis.' }
  ];

  if (user?.dietaryPreference === 'Vegan') {
    recommendationTitle = 'Smart Vegan Energy Highlights';
    recommendedItems = [
      { name: 'Sprouted Moong Salad', desc: 'Excellent micronutrients + organic protein.' },
      { name: 'Tofu Bhurji', desc: 'High soy protein, zero cholesterol, low fats.' },
      { name: 'Roasted Chana / Chickpeas', desc: 'Crispy low-glycemic complex carbs and fiber.' }
    ];
  } else if (user?.dietaryPreference === 'None' || user?.dietaryPreference === 'Keto') {
    recommendationTitle = 'Lean Animal Protein & Keto Boosts';
    recommendedItems = [
      { name: 'Grilled Chicken Tikka', desc: 'Super lean: 32g protein, negligible carbs.' },
      { name: 'Egg White Bhurji', desc: 'Pure bioavailable protein, perfect for muscle recovery.' },
      { name: 'Tandoori Salmon / Pomfret', desc: 'High Omega-3 fats, excellent joint lubrication.' }
    ];
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, gap: 10 }}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <BurnX3DFitnessWidget type="shaker" width={48} height={48} />
          <View>
            <Text style={[styles.header, { paddingTop: 0 }]}>NUTRITION HUB</Text>
            <Text style={styles.headerSub}>Indian & Global Macro Diagnostics</Text>
          </View>
        </View>

        {/* Supplementation Link */}
        <TouchableOpacity style={styles.suppLinkCard} onPress={() => navigation.navigate('SupplementsScreen')}>
          <View style={styles.suppLinkRow}>
            <View style={styles.suppLinkIcon}>
              <Ionicons name="medical" size={20} color="#FFF" />
            </View>
            <View style={styles.suppLinkTextCol}>
              <Text style={styles.suppLinkTitle}>Supplementation Guide</Text>
              <Text style={styles.suppLinkSub}>View recommended fitness stacks</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* 1. CALORIE PROGRESS RING */}
        <View style={styles.macroRingCard}>
          <View style={styles.macroRingRow}>
            <View style={styles.circleContainer}>
              <View style={styles.circleInner}>
                <Text style={styles.circleCals}>{caloriesConsumed}</Text>
                <Text style={styles.circleGoal}>/ {calorieTarget} kcal</Text>
              </View>
            </View>
            
            <View style={styles.macroProgressStats}>
              <View style={styles.macroStatBar}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>PROTEIN</Text>
                  <Text style={styles.statVals}>{proteinConsumed}g / {macroTarget.protein}g</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100, (proteinConsumed / macroTarget.protein) * 100)}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>

              <View style={styles.macroStatBar}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>CARBS</Text>
                  <Text style={styles.statVals}>{carbsConsumed}g / {macroTarget.carbs}g</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100, (carbsConsumed / macroTarget.carbs) * 100)}%`, backgroundColor: '#FFC107' }]} />
                </View>
              </View>

              <View style={styles.macroStatBar}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>FATS</Text>
                  <Text style={styles.statVals}>{fatsConsumed}g / {macroTarget.fats}g</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100, (fatsConsumed / macroTarget.fats) * 100)}%`, backgroundColor: '#E91E63' }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. SEARCH ENGINE */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Add Portion Foods</Text>
          <View style={styles.searchRow}>
            <View style={styles.inputFrame}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Indian Food Database..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
            </View>
            
            <View style={styles.weightFrame}>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.weightUnit}>g</Text>
            </View>
          </View>

          {/* Web Database Search trigger */}
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity style={styles.webSearchBtn} onPress={handleSearchWeb}>
              {isSearchingWeb ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="globe-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.webSearchBtnText}>Search Web Registry Estimates</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Manual Entry Trigger */}
          <TouchableOpacity style={[styles.webSearchBtn, { marginTop: 10, backgroundColor: 'transparent' }]} onPress={() => setCustomModalVisible(true)}>
            <Ionicons name="create-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.webSearchBtnText, { color: colors.primary }]}>Enter Food Manually</Text>
          </TouchableOpacity>

          {/* Search results catalog */}
          {searchResults.length > 0 && (
            <View style={styles.resultsBox}>
              {searchResults.map((food) => (
                <TouchableOpacity key={food.id} style={styles.resultItem} onPress={() => triggerAddFoodFlow(food)}>
                  <View style={styles.resultItemTextCol}>
                    <Text style={styles.resultItemName}>{food.name}</Text>
                    <Text style={styles.resultItemDetails}>
                      {food.portionSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                    </Text>
                  </View>
                  <View style={styles.resultItemAddCol}>
                    <Text style={styles.resultItemCals}>{food.calories} kcal</Text>
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 3. DIARY LOGGER CATEGORIES */}
        <View style={styles.diarySection}>
          <Text style={styles.sectionTitle}>Portion Log Diary</Text>
          {mealCategories.map((cat) => {
            const items = loggedFoods.filter(f => f.mealCategory === cat);
            const categoryCals = items.reduce((acc, curr) => acc + (curr.calories || 0), 0);
            
            return (
              <View key={cat} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{cat}</Text>
                  <Text style={styles.mealCalsSum}>
                    {categoryCals > 0 ? `${categoryCals} kcal` : ''}
                  </Text>
                </View>
                
                {items.length > 0 ? (
                  <View style={styles.loggedFoodList}>
                    {items.map((food) => (
                      <View key={food.id} style={styles.loggedFoodItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.loggedFoodName}>{food.name} ({food.weight}g)</Text>
                          <Text style={styles.loggedFoodMacros}>
                            🔥 {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => removeFood(food.id)} style={styles.deleteFoodBtn}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyMealText}>No foods logged yet.</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* 4. SMART RECOMMENDATIONS */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.recommendationTitle}>{recommendationTitle}</Text>
          </View>
          <Text style={styles.recommendationDesc}>Dynamic highlights matching your local "{user?.dietaryPreference || 'None'}" preference:</Text>
          
          <View style={styles.recommendationItemsList}>
            {recommendedItems.map((item, idx) => (
              <View key={idx} style={styles.recItem}>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                <View style={styles.recItemTextCol}>
                  <Text style={styles.recItemName}>{item.name}</Text>
                  <Text style={styles.recItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* PORTION DIARY LOG MODAL */}
      <Modal visible={logModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeFoodItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Configure Portion Log</Text>
                  <TouchableOpacity onPress={() => setLogModalVisible(false)}>
                    <Ionicons name="close" size={28} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedFoodCard}>
                  <Text style={styles.selectedFoodName}>{activeFoodItem.name}</Text>
                  <Text style={styles.selectedFoodSpecs}>
                    Standard Base (100g): {activeFoodItem.calories} kcal | Protein: {activeFoodItem.protein}g | Carbs: {activeFoodItem.carbs}g | Fats: {activeFoodItem.fats}g
                  </Text>
                </View>

                <View style={styles.modalForm}>
                  <Text style={styles.formLabel}>Log under Meal Category</Text>
                  <View style={styles.categoryPickerRow}>
                    {mealCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.pickerBtn, selectedMealCategory === cat && styles.pickerBtnActive]}
                        onPress={() => setSelectedMealCategory(cat)}
                      >
                        <Text style={[styles.pickerBtnText, selectedMealCategory === cat && { color: colors.background }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.formLabel, { marginTop: 15 }]}>Portion Weight (grams)</Text>
                  <View style={styles.portionWeightBox}>
                    <TextInput
                      style={styles.modalWeightInput}
                      keyboardType="numeric"
                      value={weightInput}
                      onChangeText={setWeightInput}
                    />
                    <Text style={styles.formUnitLabel}>grams</Text>
                  </View>
                  <Text style={styles.portionFormulaNote}>Nutritional values will automatically scale relative to the selected weight portion.</Text>
                </View>

                <TouchableOpacity style={styles.modalSubmitBtn} onPress={logFoodItem}>
                  <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSubmitText}>Add to Portion Log</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* CUSTOM DIARY LOG MODAL */}
      <Modal visible={customModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manual Entry</Text>
                <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <Text style={styles.formLabel}>Food Name</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="e.g. Homemade Roti"
                  placeholderTextColor={colors.textSecondary}
                  value={customFood.name}
                  onChangeText={(text) => setCustomFood({ ...customFood, name: text })}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Calories (kcal)</Text>
                    <TextInput
                      style={styles.customInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={customFood.calories}
                      onChangeText={(text) => setCustomFood({ ...customFood, calories: text })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.customInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={customFood.protein}
                      onChangeText={(text) => setCustomFood({ ...customFood, protein: text })}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.customInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={customFood.carbs}
                      onChangeText={(text) => setCustomFood({ ...customFood, carbs: text })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Fats (g)</Text>
                    <TextInput
                      style={styles.customInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      value={customFood.fats}
                      onChangeText={(text) => setCustomFood({ ...customFood, fats: text })}
                    />
                  </View>
                </View>

                <Text style={[styles.formLabel, { marginTop: 20 }]}>Log under Meal Category</Text>
                <View style={[styles.categoryPickerRow, { flexWrap: 'wrap', gap: 10 }]}>
                  {mealCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pickerBtn, { minWidth: '45%' }, selectedMealCategory === cat && styles.pickerBtnActive]}
                      onPress={() => setSelectedMealCategory(cat)}
                    >
                      <Text style={[styles.pickerBtnText, selectedMealCategory === cat && { color: colors.background }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={[styles.modalSubmitBtn, { marginTop: 25 }]} onPress={logCustomFood}>
                <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalSubmitText}>Add Custom Log</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { padding: ui.spacing.m, paddingBottom: ui.spacing.xxl },
  
  header: { ...typography.largeTitle, color: colors.primary, paddingTop: 10, letterSpacing: 1 },
  headerSub: { ...typography.subhead, color: colors.textSecondary, marginTop: 4, marginBottom: ui.spacing.l },

  suppLinkCard: { backgroundColor: colors.surface, padding: ui.spacing.l, borderRadius: ui.borderRadiusLg, marginBottom: ui.spacing.l, borderWidth: 1, borderColor: colors.primary, ...ui.shadowLg },
  suppLinkRow: { flexDirection: 'row', alignItems: 'center' },
  suppLinkIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m },
  suppLinkTextCol: { flex: 1 },
  suppLinkTitle: { ...typography.headline, color: colors.textPrimary },
  suppLinkSub: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },

  macroRingCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg },
  macroRingRow: { flexDirection: 'row', alignItems: 'center' },
  circleContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 10, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: ui.spacing.m, ...ui.shadowSm },
  circleInner: { alignItems: 'center' },
  circleCals: { ...typography.largeTitle, fontSize: 24, color: colors.textPrimary },
  circleGoal: { ...typography.caption, fontSize: 9, color: colors.textSecondary, fontWeight: '700', marginTop: 2 },
  macroProgressStats: { flex: 1, gap: ui.spacing.m },
  macroStatBar: {},
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statLabel: { ...typography.caption, fontSize: 10, fontWeight: '900', color: colors.textPrimary },
  statVals: { ...typography.caption, fontSize: 10, color: colors.textSecondary },
  barBg: { width: '100%', height: 6, backgroundColor: colors.surfaceSecondary, borderRadius: 3 },
  barFill: { height: '100%', borderRadius: 3 },

  searchSection: { marginBottom: ui.spacing.l },
  sectionTitle: { ...typography.headline, marginBottom: ui.spacing.m },
  searchRow: { flexDirection: 'row', gap: ui.spacing.m },
  inputFrame: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: ui.borderRadiusSm, paddingHorizontal: ui.spacing.m, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, paddingVertical: 14, ...typography.subhead },
  weightFrame: { width: 80, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: ui.borderRadiusSm, paddingHorizontal: ui.spacing.m, borderWidth: 1, borderColor: colors.border },
  weightInput: { flex: 1, color: colors.textPrimary, textAlign: 'center', ...typography.headline },
  weightUnit: { ...typography.subhead, color: colors.textSecondary, marginLeft: 2, fontWeight: '700' },
  
  webSearchBtn: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary, borderRadius: ui.borderRadiusSm, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: ui.spacing.m },
  webSearchBtnText: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },

  resultsBox: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, marginTop: ui.spacing.m, ...ui.shadow, overflow: 'hidden' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: ui.spacing.m, borderBottomWidth: 1, borderBottomColor: colors.surfaceSecondary },
  resultItemTextCol: { flex: 1, paddingRight: ui.spacing.m },
  resultItemName: { ...typography.subhead, fontWeight: '700', color: colors.textPrimary },
  resultItemDetails: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  resultItemAddCol: { alignItems: 'flex-end', gap: 4 },
  resultItemCals: { ...typography.subhead, fontWeight: '900', color: colors.primary },

  diarySection: { marginBottom: ui.spacing.l },
  mealCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.m, marginBottom: ui.spacing.m, borderWidth: 1, borderColor: colors.border, ...ui.shadowLg },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.s },
  mealTitle: { ...typography.headline, color: colors.primary },
  mealCalsSum: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  emptyMealText: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  loggedFoodList: { gap: ui.spacing.m, marginTop: ui.spacing.s },
  loggedFoodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border },
  loggedFoodName: { ...typography.subhead, fontWeight: '700', color: colors.textPrimary },
  loggedFoodMacros: { ...typography.caption, fontSize: 10, color: colors.textSecondary, marginTop: 4 },
  deleteFoodBtn: { padding: ui.spacing.xs },

  recommendationsCard: { backgroundColor: colors.surface, borderRadius: ui.borderRadiusLg, padding: ui.spacing.l, marginBottom: ui.spacing.l, ...ui.shadowLg, borderLeftWidth: 4, borderLeftColor: colors.primary },
  recommendationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: ui.spacing.s },
  recommendationTitle: { ...typography.headline, color: colors.textPrimary, marginLeft: 8 },
  recommendationDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: ui.spacing.m, lineHeight: 18 },
  recommendationItemsList: { gap: ui.spacing.m },
  recItem: { flexDirection: 'row', alignItems: 'flex-start' },
  recItemTextCol: { flex: 1, marginLeft: 8 },
  recItemName: { ...typography.subhead, fontWeight: '700', color: colors.primary },
  recItemDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: ui.borderRadiusLg, borderTopRightRadius: ui.borderRadiusLg, padding: ui.spacing.l, height: '75%', justifyContent: 'space-between' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ui.spacing.l },
  modalTitle: { ...typography.title, color: colors.primary },
  selectedFoodCard: { backgroundColor: colors.surfaceSecondary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border },
  selectedFoodName: { ...typography.headline, color: colors.textPrimary },
  selectedFoodSpecs: { ...typography.caption, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  modalForm: { marginTop: ui.spacing.l, flex: 1 },
  formLabel: { ...typography.subhead, fontWeight: '700', color: colors.primary, marginBottom: ui.spacing.s },
  categoryPickerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: ui.spacing.s },
  pickerBtn: { flex: 1, backgroundColor: colors.surfaceSecondary, paddingVertical: 12, borderRadius: ui.borderRadiusSm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pickerBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickerBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  portionWeightBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: ui.spacing.m, width: 140, marginTop: ui.spacing.s },
  modalWeightInput: { color: colors.textPrimary, ...typography.title, paddingVertical: 12, flex: 1, textAlign: 'center' },
  formUnitLabel: { ...typography.subhead, color: colors.textSecondary, fontWeight: '700' },
  portionFormulaNote: { ...typography.caption, fontSize: 10, color: colors.textSecondary, fontStyle: 'italic', marginTop: ui.spacing.m, lineHeight: 16 },
  modalSubmitBtn: { flexDirection: 'row', backgroundColor: colors.primary, height: ui.buttonHeight, borderRadius: ui.borderRadius, justifyContent: 'center', alignItems: 'center', ...ui.shadow },
  modalSubmitText: { color: '#FFF', ...typography.headline },
  customInput: { backgroundColor: colors.surfaceSecondary, color: colors.textPrimary, padding: ui.spacing.m, borderRadius: ui.borderRadiusSm, borderWidth: 1, borderColor: colors.border, ...typography.subhead }
});
