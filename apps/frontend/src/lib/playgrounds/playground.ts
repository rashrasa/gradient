
export type Subject = "MATH-APPLIED";
export type Category = "SIGNALS";
export type Playground = "FOURIER";

export interface SubjectDescriptor {
    readonly title: string;
    readonly description?: string;
}

export interface CategoryDescriptor {
    readonly subject: Subject
    readonly title: string;
    readonly description: string;
}

export interface PlaygroundDescriptor {
    readonly category: Category;
    readonly title: string;
    readonly description: string;
    readonly author: string,
    readonly version: string
}

export interface GradientPlaygrounds {
    subjects: { [K in Subject]: SubjectDescriptor };
    categories: { [K in Category]: CategoryDescriptor };
    playgrounds: { [K in Playground]: PlaygroundDescriptor };
}

export const PLAYGROUNDS: GradientPlaygrounds = {
    subjects: {
        "MATH-APPLIED": {
            title: "Applied Mathematics",
        }
    },
    categories: {
        "SIGNALS": {
            subject: "MATH-APPLIED",
            title: "Signal Processing",
            description: "The study of continuous and discrete signals and their applications."
        }
    },
    playgrounds: {
        "FOURIER": {
            category: "SIGNALS",
            title: "Fourier Transform",
            description: "Gain an intuition on fourier transforms by seeing how a complex audio clip can be represented as a series of sinusoids.",
            author: "Ahmed Rashrash",
            version: "0.1.0"
        }
    }
}