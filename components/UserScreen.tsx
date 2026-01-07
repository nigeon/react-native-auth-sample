import {
	useEmbeddedEthereumWallet,
	useOAuth,
	useSignOut,
	useUser
} from "@openfort/react-native";
import { Picker } from '@react-native-picker/picker';
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SiweMessage } from "siwe";
import { getAddress, stringToHex } from "viem";
import { useGnosisPay } from "./useGnosisPay";
import { COLORS, styles } from "./UserScreen.styles";

const GnosisButton = ({ title, onPress, disabled, style, textStyle }: any) => (
	<TouchableOpacity
		style={[
			styles.button,
			disabled && styles.buttonDisabled,
			style
		]}
		onPress={onPress}
		disabled={disabled}
	>
		<Text style={[styles.buttonText, textStyle]}>{title}</Text>
	</TouchableOpacity>
);

const GnosisInput = (props: any) => (
	<TextInput
		{...props}
		style={[styles.input, props.style]}
		placeholderTextColor={COLORS.textSecondary}
	/>
);

export const UserScreen = () => {
	const [chainId, setChainId] = useState("84532");
	const [gnosisToken, setGnosisToken] = useState<string | null>(null);
	const [gnosisStep, setGnosisStep] = useState<'connect' | 'login' | 'kyc' | 'sourceOfFunds' | 'phone' | 'safeWallet'>('connect');
	const [gnosisUser, setGnosisUser] = useState<any | null>(null);
	const [email, setEmail] = useState<string>('');
	const [phone, setPhone] = useState<string>('');
	const [sentPhoneOTP, setSentPhoneOTP] = useState<boolean>(false);
	const [phoneOTP, setPhoneOTP] = useState<string>('');
	const [sourceOfFundsQuestions, setSourceOfFundsQuestions] = useState<any | null>(null);
	const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

	const { signOut } = useSignOut();
	const { user } = useUser();
	const [connectingWalletAddress, setConnectingWalletAddress] = useState<
		string | null
	>(null);
	const { linkOauth, isLoading: isOAuthLoading } = useOAuth();

	const { wallets, setActive, create, activeWallet, status } =
		useEmbeddedEthereumWallet();
	const { getNonce, getAccessToken, getUser, signup, getKycUrl, getSourceOfFundsQuestions, postSourceOfFundsAnswers, getPhoneOTP, verifyPhone } = useGnosisPay();

	useEffect(() => {
		console.log('STATUS CHECK!', gnosisToken)
		if (!gnosisToken) {
			setGnosisStep('connect');
			return;
		}

		checkUserStatus();
	}, [gnosisToken, gnosisUser, gnosisStep]);

	const checkUserStatus = async () => {
		if (!gnosisToken) {
			setGnosisStep('connect');
			return;
		}

		if (!gnosisUser && gnosisStep !== 'login') {
			login();
			return;
		}

		if (gnosisUser && gnosisUser.kycStatus !== 'approved') {
			kyc();
			return;
		}

		if (gnosisUser && gnosisUser.isSourceOfFundsAnswered === false) {
			sourceOfFunds();
			return;
		}

		if (gnosisUser && gnosisUser.isPhoneValidated === false) {
			setGnosisStep('phone');
			return;
		}

		if (gnosisUser && gnosisUser.safeWallets.length == 0) {
			deployGnosisSafe();
			return;
		}
	}

	const connect = async () => {
		try {
			if (!activeWallet) {
				alert("No active wallet selected");
				return;
			}
			const walletAddress = getAddress(activeWallet.address);

			// Get Gnosis Pay nonce
			const nonce = await getNonce() as string;

			// Prepare SIWE message
			const message = new SiweMessage({
				domain: "app.gnosispay.com",
				address: walletAddress,
				statement: "Sign in with Ethereum to the app.",
				uri: "https://app.gnosispay.com",
				version: "1",
				chainId: 100,
				nonce,
			});
			const preparedMessage = message.prepareMessage();

			// Signing the message with wallet
			const provider = await activeWallet.getProvider();
			const signature = await provider.request({
				method: "personal_sign",
				params: [stringToHex(preparedMessage), walletAddress as `0x${string}`],
			});

			const token = await getAccessToken(preparedMessage, signature as string);
			setGnosisToken(token);
		} catch (e) {
			console.error(e);
		}
	};

	const login = async () => {
		if (!gnosisToken) {
			alert('No token');
			return;
		}

		let user = await getUser(gnosisToken);
		console.log('USER: ', user);
		if (!user || user.error) {
			setGnosisStep('login');
			return;
		}

		setGnosisUser(user);
	};

	const signupAndLogin = async () => {
		await signup(gnosisToken!, email);
		await checkUserStatus();
	};

	const kyc = async () => {
		if (!gnosisToken || !gnosisUser) {
			alert('No token || user');
			return;
		}

		// If user is not started or documents requested
		if (gnosisUser.kycStatus === 'approved') {
			return;
		}

		// TODO
		// Check if the kyc status changes to approved

		const response = await getKycUrl(gnosisToken);
		const url = response?.url || response?.iframeUrl;
		if (url) {
			setGnosisStep('kyc');
			await WebBrowser.openBrowserAsync(url);
		} else {
			alert("Failed to get KYC URL");
		}

	};

	const sourceOfFunds = async () => {
		if (!gnosisToken || !gnosisUser) {
			alert('No token || user');
			return;
		}

		const questions = await getSourceOfFundsQuestions(gnosisToken);
		setSourceOfFundsQuestions(questions);
		if (questions) {
			setGnosisStep('sourceOfFunds');
		}
	};

	const submitSourceOfFunds = async () => {
		if (!gnosisToken || !sourceOfFundsQuestions) return;

		try {
			let answersArray = Object.entries(selectedAnswers).map(([question, answer]) => ({ question, answer }));
			await postSourceOfFundsAnswers(gnosisToken, answersArray);
			await checkUserStatus();
		} catch (e) {
			console.error("Error submitting answers", e);
			alert("Error submitting answers");
		}
	};

	const getPhoneCode = async () => {
		await getPhoneOTP(gnosisToken!, phone);
		setSentPhoneOTP(true);
	};

	const verifyPhoneCode = async () => {
		await verifyPhone(gnosisToken!, phoneOTP);
		await checkUserStatus();
	}

	const deployGnosisSafe = async () => {
		if (!gnosisToken || !gnosisUser) {
			alert('No token || user');
			return;
		}
		console.log('deploying stuff');
	}

	if (!user) {
		return null;
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.card}>
				<View style={styles.header}>
					<Text style={styles.title}>Gnosis Pay</Text>
					<Text style={styles.subtitle}>{user.id}</Text>
				</View>

				<View style={styles.section}>
					{activeWallet?.address ? (
						<View style={styles.walletInfo}>
							<Text style={styles.label}>Active Wallet</Text>
							<Text style={styles.value}>{`${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`}</Text>
						</View>
					) : (
						<Text style={styles.label}>No active wallet</Text>
					)}

					<Text style={styles.sectionTitle}>Available Wallets</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletList}>
						{wallets.map((w, i) => (
							<TouchableOpacity
								key={w.address + i}
								style={[styles.walletChip, activeWallet?.address === w.address && styles.walletChipActive]}
								onPress={() => {
									setConnectingWalletAddress(w.address);
									setActive({
										address: w.address as `0x${string}`,
										chainId: Number(chainId),
										recoveryPassword: "test-password",
										onSuccess: () => {
											setConnectingWalletAddress(null);
										},
										onError: (error: any) => {
											setConnectingWalletAddress(null);
											alert(`Error: ${error.message}`);
										},
									})
								}}
							>
								<Text style={[styles.walletChipText, activeWallet?.address === w.address && styles.walletChipTextActive]}>
									{`${w.address.slice(0, 6)}...`}
								</Text>
								{status === "connecting" && connectingWalletAddress === w.address && (
									<ActivityIndicator size="small" color={activeWallet?.address === w.address ? COLORS.primary : COLORS.text} />
								)}
							</TouchableOpacity>
						))}
					</ScrollView>

					<GnosisButton
						title={status === "creating" ? "Creating Wallet..." : "Create New Wallet"}
						onPress={() =>
							create({
								recoveryPassword: "test-password",
								onError: (error: any) => alert("Error: " + error.message),
								onSuccess: ({ account }: any) => alert("Wallet created: " + account?.address),
							})
						}
						disabled={status === "creating"}
						style={styles.secondaryButton}
						textStyle={styles.secondaryButtonText}
					/>
				</View>

				<View style={styles.divider} />

				<View style={styles.section}>
					{activeWallet && <GnosisButton title="Connect to Gnosis Pay" onPress={connect} />}
				</View>

				{gnosisStep === 'login' && (
					<View style={styles.formSection}>
						<Text style={styles.sectionTitle}>Sign Up</Text>
						<GnosisInput
							placeholder="Email"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<GnosisButton title="Create Account" onPress={signupAndLogin} />
					</View>
				)}

				{gnosisStep === 'sourceOfFunds' && (
					<View style={styles.formSection}>
						<Text style={styles.sectionTitle}>Source of Funds</Text>
						{sourceOfFundsQuestions?.map((question: any, index: number) => (
							<View key={question.question + index} style={styles.questionContainer}>
								<Text style={styles.label}>{question.question}</Text>
								<View style={styles.pickerContainer}>
									<Picker
										selectedValue={selectedAnswers[question.question]}
										onValueChange={(itemValue: string | null) =>
											setSelectedAnswers((prev) => ({ ...prev, [question.question]: itemValue }))
										}
									>
										<Picker.Item label="Select an answer..." value={null} enabled={false} color={COLORS.textSecondary} />
										{question.answers.map((answer: any) => (
											<Picker.Item key={answer} label={answer} value={answer} color={COLORS.text} />
										))}
									</Picker>
								</View>
							</View>
						))}
						<GnosisButton
							title="Submit Answers"
							onPress={submitSourceOfFunds}
							disabled={!sourceOfFundsQuestions || Object.keys(selectedAnswers).length < sourceOfFundsQuestions.length}
						/>
					</View>
				)}

				{gnosisStep === 'phone' && (
					<View style={styles.formSection}>
						<Text style={styles.sectionTitle}>Phone Verification</Text>
						<GnosisInput
							placeholder="Phone Number (e.g. +1...)"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
						/>
						<GnosisButton title={sentPhoneOTP ? "Resend Code" : "Get Code"} onPress={getPhoneCode} style={{ marginBottom: 10 }} />

						{sentPhoneOTP && (
							<>
								<GnosisInput
									placeholder="Verification Code"
									value={phoneOTP}
									onChangeText={setPhoneOTP}
									keyboardType="number-pad"
								/>
								<GnosisButton title="Verify" onPress={verifyPhoneCode} />
							</>
						)}
					</View>
				)}

				<View style={styles.divider} />

				<GnosisButton
					title="Logout"
					onPress={() => signOut()}
					style={styles.logoutButton}
					textStyle={styles.logoutButtonText}
				/>
			</View>
		</ScrollView>
	);
};
