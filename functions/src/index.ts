import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp(functions.config().firebase);
const corsMiddleware = cors({origin: true});

export const createUser = functions.https.onRequest(async (req, res) => {
    corsMiddleware(req, res, async () => {
        try {
            // check if request is made with POST
            if (req.method !== "POST") {
                return res.status(400).json({error: "Method not allowed"});
            }
            // check if user is authenticated
            if (!req.headers.authorization) {

                return res.status(403).json({error: "Unauthorized"});
            }
            const token = req.headers.authorization.split("Bearer ")[1];


            // get email, password and role from request body
            const {phone, password, role, fName, lName} = req.body;
            console.log(token);

            // check if token is valid
            const decodedToken = await admin.auth().verifyIdToken("eyJhbGciOiJSUzI1NiIsImtpZCI6ImQxNjg5NDE1ZWMyM2EzMzdlMmJiYWE1ZTNlNjhiNjZkYzk5MzY4ODQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY3VzdG9tLW9yZGVyLXN5c3RlbSIsImF1ZCI6ImN1c3RvbS1vcmRlci1zeXN0ZW0iLCJhdXRoX3RpbWUiOjE3MDQ3MjQ4MzAsInVzZXJfaWQiOiJsNFVLeFpjWFVYTmljUEh2WHJQaUZOYUNNZVkyIiwic3ViIjoibDRVS3haY1hVWE5pY1BIdlhyUGlGTmFDTWVZMiIsImlhdCI6MTcwNDcyNTc3NCwiZXhwIjoxNzA0NzI5Mzc0LCJlbWFpbCI6ImFkbWluQG1haWwuaWUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiYWRtaW5AbWFpbC5pZSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.HM2s1pDzI17HuO_l_JjPOHagC3AL6D2JgbypgbDzgD4SvWh1X4yzgSBeraUR2RZukHL0B0BLAQBjaa2LDOOucp_pFTi9A2ls-8ikmSQYTx1NVLpCE_fApKIRig48iUNvL-DkNKXZzG7FT6oCNAHrteFTzdBYIx4_kPTfQIE2tpWKxobg-wsgqD7HF8TwScbnmTk1buBpTsKsJpWKFzbmkEB7ViAWH4HGDklUfYXXtc3rGLaNJBtifCqeStYKNuArImv_8WwWYs_SY2NBgCB8oiGD0JjbKyX-LFmOr2nJ0vPVXvjlPsip8qJBIPAcfmCGd769fHFhMGtziMw_TskS2w");
            if (!decodedToken) {
                return res.status(403).json({error: "Unauthorized"});
            }

            if (!phone || !password || !role || !fName || !lName) {
                const error = "Missing required fields:";
                const errors = [];
                if (!phone) {
                    errors.push("phone");
                }
                if (!password) {
                    errors.push("password");
                }
                if (!role) {
                    errors.push("role");
                }
                if (!fName) {
                    errors.push("fName");
                }
                if (!lName) {
                    errors.push("lName");
                }
                return res.status(400).json({error: error, missing: errors});

            }else{
                const user = await admin.auth().createUser({
                    phoneNumber: phone,
                    password: password,
                });
                await admin
                    .firestore()
                    .collection("users")
                    .doc(user.uid)
                    .set({
                        uid: user.uid,
                        phone: phone,
                        role: role,
                        valid: true,
                    });
                return res
                    .status(200)
                    .json({message: "Successfully created user", user: user});
            }

        } catch (error) {
            console.error("Error sending message", error);
            return res.status(500).json({error: error});
        }
    });
});
