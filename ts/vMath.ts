export default class vMath {

  static TAU: number = Math.PI * 2;

  static isUnit(n: number): boolean {
    return !(n < 0 || n > 1);
  }

  static isSmall(n: number): boolean {
    return Math.abs(n) < 1e-6;
  }
}