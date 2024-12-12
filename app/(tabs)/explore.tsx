import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRunning, faClock, faFire, faUser, faTrophy, faCog, faPhone } from '@fortawesome/free-solid-svg-icons';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Profile Picture */}
        <View style={styles.profilePicture}></View>
        {/* Name and Role */}
        <Text style={styles.name}>Andrew</Text>
        <Text style={styles.role}>Beginner</Text>
      </View>

      {/* Total Progress Section */}
      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Total progress</Text>
        <View style={styles.progressContainer}>
          {/* Distance */}
          <View style={styles.progressItem}>
            <FontAwesomeIcon icon={faRunning} size={24} color="#FFA500" />
            <Text style={styles.progressValue}>103,2</Text>
            <Text style={styles.progressLabel}>km</Text>
          </View>
          {/* Time */}
          <View style={styles.progressItem}>
            <FontAwesomeIcon icon={faClock} size={24} color="#4682B4" />
            <Text style={styles.progressValue}>16,9</Text>
            <Text style={styles.progressLabel}>hr</Text>
          </View>
          {/* Calories */}
          <View style={styles.progressItem}>
            <FontAwesomeIcon icon={faFire} size={24} color="#FF6347" />
            <Text style={styles.progressValue}>1,5k</Text>
            <Text style={styles.progressLabel}>kcal</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem icon={faUser} label="Personal parameters" />
        <MenuItem icon={faTrophy} label="Achievements" />
        <MenuItem icon={faCog} label="Settings" />
        <MenuItem icon={faPhone} label="Our contact" />
      </View>
    </ScrollView>
  );
};

interface MenuItemProps {
  icon: any;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label }) => (
  <TouchableOpacity style={styles.menuItem}>
    <FontAwesomeIcon icon={icon} size={24} color="#555" />
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    minHeight: 300,
    justifyContent: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    backgroundColor: '#D3D3D3', // Couleur uniforme
    borderRadius: 40,
    margin: 10,
  },
  name: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    color: '#EEE',
  },
  progressCard: {
    backgroundColor: '#FFF',
    margin: 22,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
  },
  menu: {
    backgroundColor: '#FFF',
    margin: 22,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
