
export enum ParticleTextureSize {
    Small = 512,
    Medium = 1024,
    Large = 2048,
}

export enum ParticleCount {
    Low = 262_144,
    Medium = 1_048_576,
    High = 4_194_304,
}

export const DEFAULT_PARTICLE_TEXTURE_SIZE = ParticleTextureSize.Medium;
export const DEFAULT_PARTICLE_COUNT = ParticleCount.Medium;
export type Label = 'neutral' | 'left' | 'right' | 'up' | 'wide';

const ParticleMapping: Record<ParticleTextureSize, ParticleCount> = {
    [ParticleTextureSize.Small]: ParticleCount.Low,
    [ParticleTextureSize.Medium]: ParticleCount.Medium,
    [ParticleTextureSize.Large]: ParticleCount.High,
};

export function textureSizeToParticleCount(size: ParticleTextureSize): ParticleCount {
    return ParticleMapping[size];
}

export function particleCountToTextureSize(count: ParticleCount): ParticleTextureSize | undefined {
    return Object.keys(ParticleMapping).find(
        key => ParticleMapping[key as ParticleTextureSize] === count
    ) as ParticleTextureSize | undefined;
}
