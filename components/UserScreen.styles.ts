import { StyleSheet } from "react-native";

export const COLORS = {
    background: "#F5F3F0",
    primary: "#CDDF52",
    text: "#000000",
    textSecondary: "#666564",
    border: "#E9E9E9",
    white: "#FFFFFF",
};

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: COLORS.background,
        // In strictly matching the design, the "card" might just be the content area on the background.
        // Use transparent or same bg.
        maxWidth: 600, // Constrain width for larger screens
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        fontFamily: "System", // Or DM Sans if available
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: COLORS.text,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 8,
    },
    value: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 20,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.text,
        marginTop: 10,
    },
    secondaryButtonText: {
        color: COLORS.text,
    },
    logoutButton: {
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    logoutButtonText: {
        color: COLORS.textSecondary,
        textDecorationLine: 'underline',
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 15,
    },
    walletInfo: {
        marginBottom: 15,
    },
    walletList: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    walletChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    walletChipActive: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    walletChipText: {
        fontSize: 14,
        color: COLORS.text,
    },
    walletChipTextActive: {
        color: COLORS.white,
    },
    formSection: {
        marginTop: 10,
    },
    questionContainer: {
        marginBottom: 20,
    },
    pickerContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        overflow: 'hidden', // Ensure native picker doesn't bleed
    },
});
