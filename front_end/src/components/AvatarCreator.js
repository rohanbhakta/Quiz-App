import React, { useState } from 'react';
import { 
  Box,
  Typography,
  Grid,
  Paper,
  useTheme
} from '@mui/material';

const AvatarCreator = ({ value, onChange }) => {
  const theme = useTheme();
  
  // Predefined avatars with complete configuration - 5 male and 5 female office looks
  const predefinedAvatars = [
    // Male Avatars
    {
      style: 'avataaars',
      seed: 'male1',
      backgroundColor: '#F5F5F5',
      accessories: ['prescription01'],
      skinColor: '#F8D5C2',
      hairColor: '#2C1810',
      facialHair: 'beardLight',
      clothing: 'blazerShirt',
      clothingColor: '#2C3E50',
      hairStyle: 'shortHairShortFlat',
      eyebrows: 'default',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'male2',
      backgroundColor: '#F5F5F5',
      accessories: ['round'],
      skinColor: '#D08B5B',
      hairColor: '#4A4A4A',
      facialHair: 'beardMedium',
      clothing: 'blazerSweater',
      clothingColor: '#34495E',
      hairStyle: 'shortHairSides',
      eyebrows: 'default',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'male3',
      backgroundColor: '#F5F5F5',
      accessories: [],
      skinColor: '#EDB98A',
      hairColor: '#4A4A4A',
      facialHair: 'moustacheFancy',
      clothing: 'blazerShirt',
      clothingColor: '#2C3E50',
      hairStyle: 'shortHairTheCaesar',
      eyebrows: 'default',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'male4',
      backgroundColor: '#F5F5F5',
      accessories: ['prescription02'],
      skinColor: '#F8D5C2',
      hairColor: '#2C1810',
      facialHair: 'beardLight',
      clothing: 'blazerSweater',
      clothingColor: '#34495E',
      hairStyle: 'shortHairShortWaved',
      eyebrows: 'default',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'male5',
      backgroundColor: '#F5F5F5',
      accessories: [],
      skinColor: '#D08B5B',
      hairColor: '#2C1810',
      facialHair: 'beardMajestic',
      clothing: 'blazerShirt',
      clothingColor: '#2C3E50',
      hairStyle: 'shortHairDreads01',
      eyebrows: 'default',
      eyes: 'default',
      mouth: 'default'
    },
    // Female Avatars
    {
      style: 'avataaars',
      seed: 'female1',
      backgroundColor: '#F5F5F5',
      accessories: ['prescription01'],
      skinColor: '#F8D5C2',
      hairColor: '#2C1810',
      facialHair: '',
      clothing: 'blazerShirt',
      clothingColor: '#2C3E50',
      hairStyle: 'longHairStraight',
      eyebrows: 'raised',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'female2',
      backgroundColor: '#F5F5F5',
      accessories: ['round'],
      skinColor: '#EDB98A',
      hairColor: '#4A4A4A',
      facialHair: '',
      clothing: 'blazerSweater',
      clothingColor: '#34495E',
      hairStyle: 'longHairBob',
      eyebrows: 'raised',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'female3',
      backgroundColor: '#F5F5F5',
      accessories: [],
      skinColor: '#F8D5C2',
      hairColor: '#4A4A4A',
      facialHair: '',
      clothing: 'blazerShirt',
      clothingColor: '#2C3E50',
      hairStyle: 'longHairMiaWallace',
      eyebrows: 'raised',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'female4',
      backgroundColor: '#F5F5F5',
      accessories: ['prescription02'],
      skinColor: '#D08B5B',
      hairColor: '#2C1810',
      facialHair: '',
      clothing: 'blazerSweater',
      clothingColor: '#34495E',
      hairStyle: 'longHairCurvy',
      eyebrows: 'raised',
      eyes: 'default',
      mouth: 'default'
    },
    {
      style: 'avataaars',
      seed: 'female5',
      backgroundColor: '#F5F5F5',
      accessories: [],
      skinColor: '#EDB98A',
      hairColor: '#724133',
      facialHair: '',
      clothing: 'blazerShirt',
      clothingColor: '#2C3E50',
      hairStyle: 'longHairStraight2',
      eyebrows: 'raised',
      eyes: 'default',
      mouth: 'default'
    }
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(value || predefinedAvatars[0]);

  const getAvatarUrl = (config) => {
    const params = {
      seed: config.seed,
      backgroundColor: config.backgroundColor.replace('#', ''),
      accessoriesType: config.accessories[0] || 'blank',
      clothingType: config.clothing,
      eyebrowType: config.eyebrows,
      eyeType: config.eyes,
      facialHairType: config.facialHair || 'blank',
      hairColor: config.hairColor.replace('#', ''),
      mouthType: config.mouth,
      skinColor: config.skinColor.replace('#', ''),
      topType: config.hairStyle,
      clothingColor: config.clothingColor.replace('#', '')
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `https://api.dicebear.com/7.x/avataaars/svg?${queryString}`;
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    onChange(avatar);
  };

  return (
    <Box>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3,
          color: theme.palette.primary.main,
          textAlign: 'center'
        }}
      >
        Choose Your Avatar
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {predefinedAvatars.map((avatar, index) => (
          <Grid item key={avatar.seed} xs={6} sm={2.4}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: selectedAvatar.seed === avatar.seed ? 'scale(1.05)' : 'scale(1)',
                border: selectedAvatar.seed === avatar.seed ? `2px solid ${theme.palette.primary.main}` : 'none',
                boxShadow: selectedAvatar.seed === avatar.seed ? theme.shadows[8] : theme.shadows[2],
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme.shadows[8]
                }
              }}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <Box
                component="img"
                src={getAvatarUrl(avatar)}
                alt={`Avatar option ${index + 1}`}
                sx={{
                  width: '100%',
                  height: 'auto',
                  backgroundColor: avatar.backgroundColor,
                  borderRadius: 1
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AvatarCreator;
