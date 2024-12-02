import { TelegrafContext } from '../interfaces';
import { start } from './start';

export class CommandService {
  protected start(ctx: TelegrafContext) {
    void start(ctx)
  }
}
