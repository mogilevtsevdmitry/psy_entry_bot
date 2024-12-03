declare type TelegrafContext = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;
