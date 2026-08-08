function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function describeFieldErrors(errorPayload) {  // Flattens a backend error payload (top-level `error` or per-field `fields`) into a readable message list
    const baseError = errorPayload?.error || "Something went wrong";

    if (!errorPayload?.fields || typeof errorPayload.fields !== "object") {
        return [baseError];
    }

    const fieldMessages = Object.values(errorPayload.fields);
    if (!fieldMessages.length) {
        return [baseError];
    }

    return fieldMessages.map((message) => `${baseError} - ${capitalize(message)}`);
}

export { describeFieldErrors };