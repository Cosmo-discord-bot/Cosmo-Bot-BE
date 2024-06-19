import { Colors, EmbedBuilder } from 'discord.js';

export const BaseEmbed = (data = {}, color = Colors.Blurple) => new EmbedBuilder(data).setColor(color);

export const ErrorEmbed = (text: string) => BaseEmbed().setDescription(text).setColor(Colors.Red);

export const SuccessEmbed = (text: string) => BaseEmbed().setDescription(text).setColor(Colors.Green);

export const WarningEmbed = (text: string) => BaseEmbed().setDescription(text).setColor(Colors.DarkOrange);

export const InfoEmbed = (text: string) => BaseEmbed().setDescription(text).setColor(Colors.Blurple);
