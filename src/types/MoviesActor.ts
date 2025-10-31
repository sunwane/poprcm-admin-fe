import { Movie } from './Movies';
import { Actor } from './Actor';

export interface MovieActor {
    id: string;
    movie?: Movie; // Optional for avoiding circular deps
    actor?: Actor; // Optional for avoiding circular deps
    characterName: string;
}
