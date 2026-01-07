const API_URL = 'https://api.gnosispay.com/api/v1';

export const useGnosisPay = () => {
    async function getNonce() {
        const options = { method: 'GET' };

        try {
            const response = await fetch(API_URL + '/auth/nonce', options)
            return await response.text();

        } catch (error) {
            console.error(error)
        }

    }

    async function getAccessToken(message: string, signature: string) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                signature
            })
        };

        try {
            const response = await fetch(API_URL + '/auth/challenge', options)
            if (!response.ok) {
                const parsed = await response.json()
                console.log('Response: ', response)
                throw new Error(parsed.error)
            }
            const parsed = await response.json();
            return parsed.token;
        } catch (error) {
            console.error(error)
        }
    }

    async function getUser(token: string) {
        const options = { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };

        try {
            const response = await fetch(API_URL + '/user', options)
            return await response.json();
        } catch (error) {
            console.error(error)
        }
    }

    async function signup(token: string, authEmail: string) {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authEmail,
            })
        };

        try {
            const response = await fetch(API_URL + '/auth/signup', options)
            if (!response.ok) {
                const parsed = await response.json()
                throw new Error(parsed.error)
            }

            const acceptTosOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    terms: "general-tos",
                    version: "TOS_GENERAL_VERSION_1",
                })
            };
            const acceptTosResponse = await fetch(API_URL + '/user/terms', acceptTosOptions)
            if (!acceptTosResponse.ok) {
                const parsed = await acceptTosResponse.json()
                throw new Error(parsed.error || parsed.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function getKycUrl(token: string) {
        const options = { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };
        try {
            const response = await fetch(API_URL + '/kyc/integration', options)
            return await response.json();
        } catch (error) {
            console.error(error)
        }
    }

    async function getSourceOfFundsQuestions(token: string) {
        const options = { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };

        try {
            const response = await fetch(API_URL + '/source-of-funds', options)
            return await response.json();
        } catch (error) {
            console.error(error)
        }
    }

    async function postSourceOfFundsAnswers(token: string, answers: any) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(answers)
        };

        try {
            const response = await fetch(API_URL + '/source-of-funds', options)
            return await response.json();
        } catch (error) {
            console.error(error)
        }
    }

    async function getPhoneOTP(token: string, phone: string) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                phoneNumber: phone
            })
        };

        try {
            const response = await fetch(API_URL + '/verification', options)
            return await response.json();
        } catch (error) {
            console.error(error)
        }
    }

    async function verifyPhone(token: string, code: string) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code
            })
        };

        try {
            const response = await fetch(API_URL + '/verification/check', options)
            return await response.json();
        } catch (error) {
            console.error(error)
        }
    }
    return {
        getNonce,
        getAccessToken,
        getUser,
        signup,
        getKycUrl,
        getSourceOfFundsQuestions,
        postSourceOfFundsAnswers,
        getPhoneOTP,
        verifyPhone
    }
}