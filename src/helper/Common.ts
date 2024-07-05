export class Common {
    public static sanitizeEventName(eventName: string): string {
        const invalidCharsRegex = /[^a-zA-Z0-9_\s]/g
        let sanitizedEventName = eventName.replace(invalidCharsRegex, '')
        sanitizedEventName = sanitizedEventName.replace(/\s+/g, ' ')
        sanitizedEventName = sanitizedEventName.replace(/\s/g, '-')

        return sanitizedEventName
    }

    public static getSecondArgumentFromText(text: string): string {
        try {
            const argsMatch: RegExpMatchArray | null =
                text.match('\\s+([^\\s]+)')
            if (!argsMatch)
                throw new Error('getArgsFromMessage: Arguments are missing')
            return argsMatch[1]
        } catch (error) {
            return ''
        }
    }
}
