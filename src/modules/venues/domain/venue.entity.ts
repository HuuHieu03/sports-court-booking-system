export class Venue {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly city: string,
    public readonly managerId: string,
    public readonly description?: string,
    public readonly openTime: string = '06:00',
    public readonly closeTime: string = '22:00',
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
