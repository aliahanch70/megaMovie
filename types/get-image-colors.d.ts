declare module 'get-image-colors' {
    import { Color } from 'color';
  
    function getColors(
      buffer: Buffer,
      type?: string
    ): Promise<Color[]>;
  
    export default getColors;
  }
  