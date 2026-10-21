import React from 'react';
import { GrdxLogo, GrdxLogoProps } from './GrdxLogo';

export { GrdxLogo };
export type { GrdxLogoProps };

export interface GrdxWordmarkProps extends GrdxLogoProps {}

/**
 * GrdxWordmark - Compatibility wrapper rendering the new car-silhouette GrdxLogo
 */
export const GrdxWordmark: React.FC<GrdxWordmarkProps> = (props) => {
  return <GrdxLogo {...props} />;
};

export default GrdxWordmark;
