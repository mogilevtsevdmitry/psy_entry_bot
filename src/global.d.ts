declare type TelegrafContext<T = any> = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;
