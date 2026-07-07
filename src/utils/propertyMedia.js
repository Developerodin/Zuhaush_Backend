const DISPLAY_MEDIA_TYPES = new Set(['image', 'video']);

const DEFAULT_PROPERTY_IMAGE_URL =
  'https://vsc-files-storage.s3.ap-south-1.amazonaws.com/zuhaush-default-property.png';

const getBuilderLogoUrl = (builder) => {
  if (!builder || typeof builder !== 'object') {
    return null;
  }
  return builder.logo || null;
};

/**
 * Ensure property API payloads always include at least one image/video media item.
 * The live mobile app assumes `type: images` properties have an `images` array,
 * which is only built when media contains image/video entries.
 */
const normalizePropertyMediaForClient = (property) => {
  if (!property || typeof property !== 'object') {
    return property;
  }

  if (!Array.isArray(property.media)) {
    property.media = [];
  }

  const hasDisplayMedia = property.media.some((item) => DISPLAY_MEDIA_TYPES.has(item?.type));
  if (hasDisplayMedia) {
    return property;
  }

  const fallbackUrl = getBuilderLogoUrl(property.builder) || DEFAULT_PROPERTY_IMAGE_URL;

  property.media.unshift({
    type: 'image',
    url: fallbackUrl,
    caption: 'No media uploaded',
    isPrimary: true,
  });

  return property;
};

export { normalizePropertyMediaForClient, DEFAULT_PROPERTY_IMAGE_URL };
