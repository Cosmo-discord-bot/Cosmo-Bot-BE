export const sanitizeEventName = (eventName: string): string => {
    // Define a regular expression to match invalid characters
    const invalidCharsRegex = /[^a-zA-Z0-9_-\s]/g;

    // Replace invalid characters with an empty string
    let sanitizedEventName = eventName.replace(invalidCharsRegex, '');

    // Replace multiple spaces with a single space
    sanitizedEventName = sanitizedEventName.replace(/\s+/g, ' ');

    // Replace spaces with a single hyphen
    sanitizedEventName = sanitizedEventName.replace(/\s/g, '-');

    return sanitizedEventName;
};
