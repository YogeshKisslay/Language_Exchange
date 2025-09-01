


// import React from 'react';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import powerTokenImg from '../assets/power-token.png'; // Placeholder for power token image (lightning bolt)
// import coinTokenImg from '../assets/coin-token.png'; // Placeholder for coin token image (coin stack)
// import premiumImg from '../assets/crown.png'; // Placeholder for premium image (crown)

// const Store = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   const handlePayment = async (type, amount, description, successMessage) => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to make a purchase');
//       return;
//     }
//     console.log('Sending payment request:', { type, amount });
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type, amount }),
//         }
//       );
//       const orderData = await orderResponse.json();
//       if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

//       const options = {
//         key: import.meta.env.VITE_BACKEND_URL.includes('localhost')
//           ? import.meta.env.VITE_RAZORPAY_KEY_ID
//           : import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description,
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type,
//           };
//           const verifyRes = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
//             {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(verifyData),
//             }
//           );
//           const verifyResult = await verifyRes.json();
//           if (verifyResult.message) {
//             toast.success(successMessage);
//           } else {
//             toast.error('Payment verification failed');
//           }
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error(error.message || 'Failed to initiate payment');
//     }
//   };

//   const handleExchangePowerTokens = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to exchange tokens');
//       return;
//     }
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/exchangePowerTokens`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ coinTokens: 1 }),
//         }
//       );
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || 'Failed to exchange tokens');
//       toast.success(result.message);
//     } catch (error) {
//       toast.error(error.message || 'Failed to exchange tokens');
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
//         Please log in to access the store.
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//       minHeight: '100vh',
//       padding: '40px 20px',
//       fontFamily: "'Poppins', sans-serif",
//     }}>
//       <h2 style={{
//         color: '#1d1e22',
//         textAlign: 'center',
//         marginBottom: '3rem',
//         fontSize: '2.5rem',
//         fontWeight: '700',
//         textShadow: '0 2px 4px rgba(254, 218, 106, 0.3)',
//         animation: 'fadeIn 0.8s ease-in',
//       }}>
//         Language Exchange Store
//       </h2>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//         gap: '2rem',
//         padding: '0 1rem',
//       }}>
//         {/* Power Tokens */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={powerTokenImg}
//             alt="Power Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Exchange for Power Tokens
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Exchange 1 Coin Token for 2 Power Tokens
//           </p>
//           <button
//             onClick={handleExchangePowerTokens}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Exchange Now
//           </button>
//         </div>
//         {/* Coins */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out 0.2s',
//           animationFillMode: 'backwards',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={coinTokenImg}
//             alt="Coin Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Buy Coins
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Get 10 Coins for ₹50
//           </p>
//           <button
//             onClick={() => handlePayment(
//               'coinTokens',
//               5000, // Amount in paise (₹50)
//               'Purchase 10 Coins',
//               'Successfully purchased 10 Coins!'
//             )}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Buy Now
//           </button>
//         </div>
//         {/* Premium Plan (Hidden for Premium Users) */}
//         {!user?.premium && (
//           <div style={{
//             backgroundColor: '#ffffff',
//             borderRadius: '20px',
//             padding: '2rem',
//             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//             transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//             animation: 'slideIn 0.5s ease-out 0.4s',
//             animationFillMode: 'backwards',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             textAlign: 'center',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform = 'translateY(-10px)';
//             e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform = 'translateY(0)';
//             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//           }}
//           >
//             <img
//               src={premiumImg}
//               alt="Premium Plan"
//               style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//             />
//             <h5 style={{
//               color: '#1d1e22',
//               fontSize: '1.5rem',
//               fontWeight: '600',
//               marginBottom: '1rem',
//             }}>
//               Buy Premium Plan
//             </h5>
//             <p style={{
//               color: '#393f4d',
//               fontSize: '1rem',
//               marginBottom: '1.5rem',
//               lineHeight: '1.5',
//             }}>
//               Get Premium + 50 Coins for ₹500
//             </p>
//             <button
//               onClick={() => handlePayment(
//                 'premium',
//                 50000, // Amount in paise (₹500)
//                 'Purchase Premium Plan',
//                 'Premium plan activated with 50 Coins!'
//               )}
//               style={{
//                 backgroundColor: '#feda6a',
//                 color: '#1d1e22',
//                 border: 'none',
//                 width: '100%',
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 fontSize: '1rem',
//                 fontWeight: '600',
//                 transition: 'background-color 0.3s ease, transform 0.3s ease',
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.backgroundColor = '#fee08f';
//                 e.target.style.transform = 'scale(1.05)';
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.backgroundColor = '#feda6a';
//                 e.target.style.transform = 'scale(1)';
//               }}
//             >
//               Buy Now
//             </button>
//           </div>
//         )}
//       </div>

//       <style>
//         {`
//           @keyframes slideIn {
//             from { transform: translateY(30px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
//           @media (max-width: 600px) {
//             div[style*="gridTemplateColumns"] {
//               grid-template-columns: 1fr;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default Store;


// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import powerTokenImg from '../assets/power-token.png';
// import coinTokenImg from '../assets/coin-token.png';
// import premiumImg from '../assets/crown.png';
// import { authApi } from '../redux/services/authApi'; // Import authApi

// const Store = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const dispatch = useDispatch(); // Get the dispatch function

//   const handlePayment = async (type, amount, description, successMessage) => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to make a purchase');
//       return;
//     }
//     console.log('Sending payment request:', { type, amount });
//     try {
//       const orderResponse = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/order`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ type, amount }),
//         }
//       );
//       const orderData = await orderResponse.json();
//       if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order');

//       const options = {
//         key: import.meta.env.VITE_BACKEND_URL.includes('localhost')
//           ? import.meta.env.VITE_RAZORPAY_KEY_ID
//           : import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description,
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type,
//           };
//           const verifyRes = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/user/payment/verify`,
//             {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(verifyData),
//             }
//           );
//           const verifyResult = await verifyRes.json();
//           if (verifyResult.message) {
//             toast.success(successMessage);
//             // Trigger a profile refresh after successful payment
//             dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//           } else {
//             toast.error('Payment verification failed');
//           }
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error(error.message || 'Failed to initiate payment');
//     }
//   };

//   const handleExchangePowerTokens = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to exchange tokens');
//       return;
//     }
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/user/exchangePowerTokens`,
//         {
//           method: 'POST',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ coinTokens: 1 }),
//         }
//       );
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || 'Failed to exchange tokens');
//       toast.success(result.message);
//       // Trigger a profile refresh after successful exchange
//       dispatch(authApi.endpoints.getProfile.initiate(user._id, { forceRefetch: true }));
//     } catch (error) {
//       toast.error(error.message || 'Failed to exchange tokens');
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
//         Please log in to access the store.
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//       minHeight: '100vh',
//       padding: '40px 20px',
//       fontFamily: "'Poppins', sans-serif",
//     }}>
//       <h2 style={{
//         color: '#1d1e22',
//         textAlign: 'center',
//         marginBottom: '3rem',
//         fontSize: '2.5rem',
//         fontWeight: '700',
//         textShadow: '0 2px 4px rgba(254, 218, 106, 0.3)',
//         animation: 'fadeIn 0.8s ease-in',
//       }}>
//         Language Exchange Store
//       </h2>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//         gap: '2rem',
//         padding: '0 1rem',
//       }}>
//         {/* Power Tokens */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={powerTokenImg}
//             alt="Power Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Exchange for Power Tokens
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Exchange 1 Coin Token for 2 Power Tokens
//           </p>
//           <button
//             onClick={handleExchangePowerTokens}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Exchange Now
//           </button>
//         </div>
//         {/* Coins */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out 0.2s',
//           animationFillMode: 'backwards',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={coinTokenImg}
//             alt="Coin Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Buy Coins
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Get 10 Coins for ₹50
//           </p>
//           <button
//             onClick={() => handlePayment(
//               'coinTokens',
//               5000, // Amount in paise (₹50)
//               'Purchase 10 Coins',
//               'Successfully purchased 10 Coins!'
//             )}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Buy Now
//           </button>
//         </div>
//         {/* Premium Plan (Hidden for Premium Users) */}
//         {!user?.premium && (
//           <div style={{
//             backgroundColor: '#ffffff',
//             borderRadius: '20px',
//             padding: '2rem',
//             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//             transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//             animation: 'slideIn 0.5s ease-out 0.4s',
//             animationFillMode: 'backwards',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             textAlign: 'center',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform = 'translateY(-10px)';
//             e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform = 'translateY(0)';
//             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//           }}
//           >
//             <img
//               src={premiumImg}
//               alt="Premium Plan"
//               style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//             />
//             <h5 style={{
//               color: '#1d1e22',
//               fontSize: '1.5rem',
//               fontWeight: '600',
//               marginBottom: '1rem',
//             }}>
//               Buy Premium Plan
//             </h5>
//             <p style={{
//               color: '#393f4d',
//               fontSize: '1rem',
//               marginBottom: '1.5rem',
//               lineHeight: '1.5',
//             }}>
//               Get Premium + 50 Coins for ₹500
//             </p>
//             <button
//               onClick={() => handlePayment(
//                 'premium',
//                 50000, // Amount in paise (₹500)
//                 'Purchase Premium Plan',
//                 'Premium plan activated with 50 Coins!'
//               )}
//               style={{
//                 backgroundColor: '#feda6a',
//                 color: '#1d1e22',
//                 border: 'none',
//                 width: '100%',
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 fontSize: '1rem',
//                 fontWeight: '600',
//                 transition: 'background-color 0.3s ease, transform 0.3s ease',
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.backgroundColor = '#fee08f';
//                 e.target.style.transform = 'scale(1.05)';
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.backgroundColor = '#feda6a';
//                 e.target.style.transform = 'scale(1)';
//               }}
//             >
//               Buy Now
//             </button>
//           </div>
//         )}
//       </div>

//       <style>
//         {`
//           @keyframes slideIn {
//             from { transform: translateY(30px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
//           @media (max-width: 600px) {
//             div[style*="gridTemplateColumns"] {
//               grid-template-columns: 1fr;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default Store;


// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import powerTokenImg from '../assets/power-token.png';
// import coinTokenImg from '../assets/coin-token.png';
// import premiumImg from '../assets/crown.png';
// import { useGetProfileQuery, useUpdateProfileMutation, authApi } from '../redux/services/authApi';
// import { callApi } from '../redux/services/callApi'; // We'll assume a hook for token exchange is here or we create a new one.

// const Store = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const { refetch: refetchProfile } = useGetProfileQuery(); // Use RTK's hook to refetch user data

//   const [exchangePowerTokensMutation] = authApi.endpoints.exchangePowerTokens.useMutation();
//   const [createPaymentOrderMutation] = authApi.endpoints.createPaymentOrder.useMutation();
//   const [verifyPaymentMutation] = authApi.endpoints.verifyPayment.useMutation();

//   const handlePayment = async (type, amount, description, successMessage) => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to make a purchase');
//       return;
//     }
//     try {
//       // Use the RTK Query mutation to create the order.
//       const orderData = await createPaymentOrderMutation({ type, amount }).unwrap();
      
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description,
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type,
//           };
//           try {
//             // Use the RTK Query mutation to verify the payment.
//             const verifyResult = await verifyPaymentMutation(verifyData).unwrap();
            
//             if (verifyResult.message) {
//               toast.success(successMessage);
//               // Refetch user profile to update token counts automatically.
//               refetchProfile();
//             } else {
//               toast.error('Payment verification failed');
//             }
//           } catch (error) {
//             toast.error(error?.data?.error || 'Payment verification failed');
//           }
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error(error?.data?.error || 'Failed to initiate payment');
//     }
//   };

//   const handleExchangePowerTokens = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to exchange tokens');
//       return;
//     }
//     try {
//       // Use the RTK Query mutation to exchange tokens.
//       const result = await exchangePowerTokensMutation({ coinTokens: 1 }).unwrap();
      
//       toast.success(result.message);
//       // Refetch user profile to update token counts automatically.
//       refetchProfile();
//     } catch (error) {
//       toast.error(error?.data?.error || 'Failed to exchange tokens');
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
//         Please log in to access the store.
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//       minHeight: '100vh',
//       padding: '40px 20px',
//       fontFamily: "'Poppins', sans-serif",
//     }}>
//       <h2 style={{
//         color: '#1d1e22',
//         textAlign: 'center',
//         marginBottom: '3rem',
//         fontSize: '2.5rem',
//         fontWeight: '700',
//         textShadow: '0 2px 4px rgba(254, 218, 106, 0.3)',
//         animation: 'fadeIn 0.8s ease-in',
//       }}>
//         Language Exchange Store
//       </h2>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//         gap: '2rem',
//         padding: '0 1rem',
//       }}>
//         {/* Power Tokens */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={powerTokenImg}
//             alt="Power Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Exchange for Power Tokens
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Exchange 1 Coin Token for 2 Power Tokens
//           </p>
//           <button
//             onClick={handleExchangePowerTokens}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Exchange Now
//           </button>
//         </div>
//         {/* Coins */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out 0.2s',
//           animationFillMode: 'backwards',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={coinTokenImg}
//             alt="Coin Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Buy Coins
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Get 10 Coins for ₹50
//           </p>
//           <button
//             onClick={() => handlePayment(
//               'coinTokens',
//               5000, // Amount in paise (₹50)
//               'Purchase 10 Coins',
//               'Successfully purchased 10 Coins!'
//             )}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Buy Now
//           </button>
//         </div>
//         {/* Premium Plan (Hidden for Premium Users) */}
//         {!user?.premium && (
//           <div style={{
//             backgroundColor: '#ffffff',
//             borderRadius: '20px',
//             padding: '2rem',
//             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//             transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//             animation: 'slideIn 0.5s ease-out 0.4s',
//             animationFillMode: 'backwards',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             textAlign: 'center',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform = 'translateY(-10px)';
//             e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform = 'translateY(0)';
//             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//           }}
//           >
//             <img
//               src={premiumImg}
//               alt="Premium Plan"
//               style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//             />
//             <h5 style={{
//               color: '#1d1e22',
//               fontSize: '1.5rem',
//               fontWeight: '600',
//               marginBottom: '1rem',
//             }}>
//               Buy Premium Plan
//             </h5>
//             <p style={{
//               color: '#393f4d',
//               fontSize: '1rem',
//               marginBottom: '1.5rem',
//               lineHeight: '1.5',
//             }}>
//               Get Premium + 50 Coins for ₹500
//             </p>
//             <button
//               onClick={() => handlePayment(
//                 'premium',
//                 50000, // Amount in paise (₹500)
//                 'Purchase Premium Plan',
//                 'Premium plan activated with 50 Coins!'
//               )}
//               style={{
//                 backgroundColor: '#feda6a',
//                 color: '#1d1e22',
//                 border: 'none',
//                 width: '100%',
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 fontSize: '1rem',
//                 fontWeight: '600',
//                 transition: 'background-color 0.3s ease, transform 0.3s ease',
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.backgroundColor = '#fee08f';
//                 e.target.style.transform = 'scale(1.05)';
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.backgroundColor = '#feda6a';
//                 e.target.style.transform = 'scale(1)';
//               }}
//             >
//               Buy Now
//             </button>
//           </div>
//         )}
//       </div>

//       <style>
//         {`
//           @keyframes slideIn {
//             from { transform: translateY(30px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
//           @media (max-width: 600px) {
//             div[style*="gridTemplateColumns"] {
//               grid-template-columns: 1fr;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default Store;

// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import powerTokenImg from '../assets/power-token.png';
// import coinTokenImg from '../assets/coin-token.png';
// import premiumImg from '../assets/crown.png';
// import { authApi } from '../redux/services/authApi';
// import {
//   useCreatePaymentOrderMutation,
//   useVerifyPaymentMutation,
//   useExchangePowerTokensMutation,
// } from '../redux/services/userApi';

// const Store = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   // Correctly initialize the RTK Query hooks
//   const [createPaymentOrder] = useCreatePaymentOrderMutation();
//   const [verifyPayment] = useVerifyPaymentMutation();
//   const [exchangePowerTokens] = useExchangePowerTokensMutation();

//   // Use the useGetProfileQuery hook to get a refetch function
//   const { refetch: refetchProfile } = authApi.endpoints.getProfile.useQuery(user?._id, { skip: !user?._id });

//   const handlePayment = async (type, amount, description, successMessage) => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to make a purchase');
//       return;
//     }
//     try {
//       // Use the correct RTK Query mutation
//       const orderData = await createPaymentOrder({ type, amount }).unwrap();
      
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Language Exchange',
//         description,
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             type,
//           };
//           try {
//             // Use the correct RTK Query mutation
//             const verifyResult = await verifyPayment(verifyData).unwrap();
            
//             if (verifyResult.message) {
//               toast.success(successMessage);
//               // Refetch user profile to update token counts automatically.
//               refetchProfile();
//             } else {
//               toast.error('Payment verification failed');
//             }
//           } catch (error) {
//             toast.error(error?.data?.error || 'Payment verification failed');
//           }
//         },
//         prefill: { name: user.name, email: user.email },
//         theme: { color: '#1d1e22' },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       toast.error(error?.data?.error || 'Failed to initiate payment');
//     }
//   };

//   const handleExchangePowerTokens = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please log in to exchange tokens');
//       return;
//     }
//     try {
//       // Use the correct RTK Query mutation
//       const result = await exchangePowerTokens({ coinTokens: 1 }).unwrap();
      
//       toast.success(result.message);
//       // Refetch user profile to update token counts automatically.
//       refetchProfile();
//     } catch (error) {
//       toast.error(error?.data?.error || 'Failed to exchange tokens');
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
//         Please log in to access the store.
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//       minHeight: '100vh',
//       padding: '40px 20px',
//       fontFamily: "'Poppins', sans-serif",
//     }}>
//       <h2 style={{
//         color: '#1d1e22',
//         textAlign: 'center',
//         marginBottom: '3rem',
//         fontSize: '2.5rem',
//         fontWeight: '700',
//         textShadow: '0 2px 4px rgba(254, 218, 106, 0.3)',
//         animation: 'fadeIn 0.8s ease-in',
//       }}>
//         Language Exchange Store
//       </h2>
//       <div style={{
//         maxWidth: '1200px',
//         margin: '0 auto',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//         gap: '2rem',
//         padding: '0 1rem',
//       }}>
//         {/* Power Tokens */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={powerTokenImg}
//             alt="Power Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Exchange for Power Tokens
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Exchange 1 Coin Token for 2 Power Tokens
//           </p>
//           <button
//             onClick={handleExchangePowerTokens}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Exchange Now
//           </button>
//         </div>
//         {/* Coins */}
//         <div style={{
//           backgroundColor: '#ffffff',
//           borderRadius: '20px',
//           padding: '2rem',
//           boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//           animation: 'slideIn 0.5s ease-out 0.2s',
//           animationFillMode: 'backwards',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           textAlign: 'center',
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.transform = 'translateY(-10px)';
//           e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.transform = 'translateY(0)';
//           e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//         }}
//         >
//           <img
//             src={coinTokenImg}
//             alt="Coin Token"
//             style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//           />
//           <h5 style={{
//             color: '#1d1e22',
//             fontSize: '1.5rem',
//             fontWeight: '600',
//             marginBottom: '1rem',
//           }}>
//             Buy Coins
//           </h5>
//           <p style={{
//             color: '#393f4d',
//             fontSize: '1rem',
//             marginBottom: '1.5rem',
//             lineHeight: '1.5',
//           }}>
//             Get 10 Coins for ₹50
//           </p>
//           <button
//             onClick={() => handlePayment(
//               'coinTokens',
//               5000, // Amount in paise (₹50)
//               'Purchase 10 Coins',
//               'Successfully purchased 10 Coins!'
//             )}
//             style={{
//               backgroundColor: '#feda6a',
//               color: '#1d1e22',
//               border: 'none',
//               width: '100%',
//               padding: '0.75rem',
//               borderRadius: '10px',
//               fontSize: '1rem',
//               fontWeight: '600',
//               transition: 'background-color 0.3s ease, transform 0.3s ease',
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#fee08f';
//               e.target.style.transform = 'scale(1.05)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#feda6a';
//               e.target.style.transform = 'scale(1)';
//             }}
//           >
//             Buy Now
//           </button>
//         </div>
//         {/* Premium Plan (Hidden for Premium Users) */}
//         {!user?.premium && (
//           <div style={{
//             backgroundColor: '#ffffff',
//             borderRadius: '20px',
//             padding: '2rem',
//             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
//             transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//             animation: 'slideIn 0.5s ease-out 0.4s',
//             animationFillMode: 'backwards',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             textAlign: 'center',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform = 'translateY(-10px)';
//             e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform = 'translateY(0)';
//             e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
//           }}
//           >
//             <img
//               src={premiumImg}
//               alt="Premium Plan"
//               style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
//             />
//             <h5 style={{
//               color: '#1d1e22',
//               fontSize: '1.5rem',
//               fontWeight: '600',
//               marginBottom: '1rem',
//             }}>
//               Buy Premium Plan
//             </h5>
//             <p style={{
//               color: '#393f4d',
//               fontSize: '1rem',
//               marginBottom: '1.5rem',
//               lineHeight: '1.5',
//             }}>
//               Get Premium + 50 Coins for ₹500
//             </p>
//             <button
//               onClick={() => handlePayment(
//                 'premium',
//                 50000, // Amount in paise (₹500)
//                 'Purchase Premium Plan',
//                 'Premium plan activated with 50 Coins!'
//               )}
//               style={{
//                 backgroundColor: '#feda6a',
//                 color: '#1d1e22',
//                 border: 'none',
//                 width: '100%',
//                 padding: '0.75rem',
//                 borderRadius: '10px',
//                 fontSize: '1rem',
//                 fontWeight: '600',
//                 transition: 'background-color 0.3s ease, transform 0.3s ease',
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.backgroundColor = '#fee08f';
//                 e.target.style.transform = 'scale(1.05)';
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.backgroundColor = '#feda6a';
//                 e.target.style.transform = 'scale(1)';
//               }}
//             >
//               Buy Now
//             </button>
//           </div>
//         )}
//       </div>

//       <style>
//         {`
//           @keyframes slideIn {
//             from { transform: translateY(30px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//           }
//           @media (max-width: 600px) {
//             div[style*="gridTemplateColumns"] {
//               grid-template-columns: 1fr;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default Store;


import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import powerTokenImg from '../assets/power-token.png';
import coinTokenImg from '../assets/coin-token.png';
import premiumImg from '../assets/crown.png';
// --- 1. IMPORT FROM THE CORRECT API ---
import { userApi } from '../redux/services/userApi';
import {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useExchangePowerTokensMutation,
} from '../redux/services/userApi';

const Store = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [createPaymentOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [exchangePowerTokens] = useExchangePowerTokensMutation();

  // --- 2. USE THE CORRECT API TO GET THE REFETCH FUNCTION ---
  const { refetch: refetchProfile } = userApi.endpoints.getProfile.useQuery(user?._id, { skip: !user?._id });

  const handlePayment = async (type, amount, description, successMessage) => {
    if (!isAuthenticated) {
      toast.error('Please log in to make a purchase');
      return;
    }
    try {
      const orderData = await createPaymentOrder({ type, amount }).unwrap();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Language Exchange',
        description,
        order_id: orderData.orderId,
        handler: async (response) => {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            type,
          };
          try {
            const verifyResult = await verifyPayment(verifyData).unwrap();
            
            if (verifyResult.message) {
              toast.success(successMessage);
              refetchProfile();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error(error?.data?.error || 'Payment verification failed');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#1d1e22' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to initiate payment');
    }
  };

  const handleExchangePowerTokens = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to exchange tokens');
      return;
    }
    try {
      const result = await exchangePowerTokens({ coinTokens: 1 }).unwrap();
      
      toast.success(result.message);
      refetchProfile();
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to exchange tokens');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ color: '#393f4d', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
        Please log in to access the store.
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <h2 style={{
        color: '#1d1e22',
        textAlign: 'center',
        marginBottom: '3rem',
        fontSize: '2.5rem',
        fontWeight: '700',
        textShadow: '0 2px 4px rgba(254, 218, 106, 0.3)',
        animation: 'fadeIn 0.8s ease-in',
      }}>
        Language Exchange Store
      </h2>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        padding: '0 1rem',
      }}>
        {/* Power Tokens */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          animation: 'slideIn 0.5s ease-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
        }}
        >
          <img
            src={powerTokenImg}
            alt="Power Token"
            style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
          />
          <h5 style={{
            color: '#1d1e22',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
          }}>
            Exchange for Power Tokens
          </h5>
          <p style={{
            color: '#393f4d',
            fontSize: '1rem',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}>
            Exchange 1 Coin Token for 2 Power Tokens
          </p>
          <button
            onClick={handleExchangePowerTokens}
            style={{
              backgroundColor: '#feda6a',
              color: '#1d1e22',
              border: 'none',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fee08f';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#feda6a';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Exchange Now
          </button>
        </div>
        {/* Coins */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          animation: 'slideIn 0.5s ease-out 0.2s',
          animationFillMode: 'backwards',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
        }}
        >
          <img
            src={coinTokenImg}
            alt="Coin Token"
            style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
          />
          <h5 style={{
            color: '#1d1e22',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
          }}>
            Buy Coins
          </h5>
          <p style={{
            color: '#393f4d',
            fontSize: '1rem',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}>
            Get 10 Coins for ₹50
          </p>
          <button
            onClick={() => handlePayment(
              'coinTokens',
              5000, // Amount in paise (₹50)
              'Purchase 10 Coins',
              'Successfully purchased 10 Coins!'
            )}
            style={{
              backgroundColor: '#feda6a',
              color: '#1d1e22',
              border: 'none',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fee08f';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#feda6a';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Buy Now
          </button>
        </div>
        {/* Premium Plan (Hidden for Premium Users) */}
        {!user?.premium && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            animation: 'slideIn 0.5s ease-out 0.4s',
            animationFillMode: 'backwards',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(254, 218, 106, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
          }}
          >
            <img
              src={premiumImg}
              alt="Premium Plan"
              style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
            />
            <h5 style={{
              color: '#1d1e22',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              Buy Premium Plan
            </h5>
            <p style={{
              color: '#393f4d',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              lineHeight: '1.5',
            }}>
              Get Premium + 50 Coins for ₹500
            </p>
            <button
              onClick={() => handlePayment(
                'premium',
                50000, // Amount in paise (₹500)
                'Purchase Premium Plan',
                'Premium plan activated with 50 Coins!'
              )}
              style={{
                backgroundColor: '#feda6a',
                color: '#1d1e22',
                border: 'none',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#fee08f';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#feda6a';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Buy Now
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (max-width: 600px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Store;