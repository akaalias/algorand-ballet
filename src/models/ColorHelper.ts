export class ColorHelper {
  public static generateRandomHexColor() : string {
    return "#" + ((1<<24)*Math.random() | 0).toString(16);
  }
}
