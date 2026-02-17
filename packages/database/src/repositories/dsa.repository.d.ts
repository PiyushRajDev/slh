export declare class DSARepository {
    find(studentId: string, platform: string): Promise<any>;
    save(profile: any): Promise<any>;
    healthCheck(): Promise<any>;
}
