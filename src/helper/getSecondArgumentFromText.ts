export const getSecondArgumentFromText = (text: string): string => {
    try {
        let argsMatch: RegExpMatchArray | null = text.match('\\s+([^\\s]+)');
        if (!argsMatch) throw new Error('getArgsFromMessage: Arguments are missing');
        return argsMatch[1];
    } catch (error) {
        return '';
    }
};
