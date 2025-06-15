import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NameAshaModal } from './NameAshaModal';
import LoadingAnimation from './LoadingAnimation';
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";

interface Question {
	id: number;
	text: string;
	options: {
		id: string;
		text: string;
		emoji: string;
		mapping?: string[];
	}[];
	type: 'multiple' | 'single' | 'contacts';
}

const questions: Question[] = [
	{
		id: 1,
		text: "What's been your recent vibe?",
		type: 'multiple',
		options: [
			{ id: 'brain', text: "My brain won't shut up", emoji: '🧠', mapping: ['Sahayak', 'Asha', 'SOS'] },
			{ id: 'numb', text: 'Feeling kinda numb or meh', emoji: '😞', mapping: ['Sahayak', 'Asha'] },
			{ id: 'overwhelmed', text: 'Overwhelmed 24x7', emoji: '🔥', mapping: ['Sahayak', 'Asha', 'SOS'] },
			{ id: 'low', text: 'Feeling low, like really low', emoji: '😔', mapping: ['Sahayak', 'Asha', 'SOS'] },
			{ id: 'confused', text: 'Just confused about life', emoji: '🙃', mapping: ['Sahayak', 'Asha'] },
			{ id: 'okay', text: 'Doing okay, just checking things out', emoji: '😊', mapping: ['Sahayak', 'Asha'] }
		]
	},
	{
		id: 2,
		text: "When you're not okay, what do you usually wanna do?",
		type: 'multiple',
		options: [
			{ id: 'talk', text: 'Rant or talk it out', emoji: '🎤', mapping: ['Satrang', 'Punching Bag', 'Asha'] },
			{ id: 'write', text: 'Write, draw, or journal', emoji: '✍️', mapping: ['Mood Journal', 'Emoji Garden'] },
			{ id: 'space', text: 'Do nothing, just need space', emoji: '😴', mapping: ['Asha'] },
			{ id: 'distract', text: 'Distract myself with games or fun', emoji: '🎮', mapping: ['Emoji Garden'] },
			{ id: 'tool', text: 'Try a tool that understands me', emoji: '🤖', mapping: ['Asha', 'Mood Journal'] }
		]
	},
	{
		id: 3,
		text: "How are your days lately?",
		type: 'multiple',
		options: [
			{ id: 'moodswings', text: 'Mood swings ki rollercoaster', emoji: '🎢', mapping: ['Mood Calendar', 'Asha'] },
			{ id: 'grey', text: 'Same grey feeling everyday', emoji: '☁️', mapping: ['Asha', 'Sahayak'] },
			{ id: 'bottling', text: 'Bottling too much inside', emoji: '🔒', mapping: ['Journal', 'Asha'] },
			{ id: 'overthinking', text: 'Overthinking every little thing', emoji: '💭', mapping: ['Asha', 'Sahayak'] },
			{ id: 'calm', text: 'Meh, kinda calm', emoji: '🧘‍♀️', mapping: ['Mood Calendar', 'Journal'] }
		]
	},
	{
		id: 4,
		text: "Want a buddy to check in on you sometimes?",
		type: 'single',
		options: [
			{ id: 'yes', text: 'Yesss please', emoji: '✅', mapping: ['Asha'] },
			{ id: 'no', text: "I'm good for now", emoji: '❌', mapping: [] }
		]
	},
	{
		id: 5,
		text: "Pick your healing vibe aesthetic",
		type: 'single',
		options: [
			{ id: 'calm', text: 'Soft sunsets & calm waves', emoji: '🌅', mapping: ['calm'] },
			{ id: 'passion', text: 'Fire & passion', emoji: '🔥', mapping: ['passion'] },
			{ id: 'fun', text: 'Fun & distractions', emoji: '🎮', mapping: ['fun'] },
			{ id: 'reflective', text: 'Deep & reflective', emoji: '📖', mapping: ['reflective'] }
		]
	},
	{
		id: 6,
		text: "Let's add 3 people who've got your back",
		type: 'contacts',
		options: []
	}
];

export const OnboardingQuestionnaire: React.FC = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string[]>>({});
	const [showNameModal, setShowNameModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; phone: string }>>([
		{ name: '', phone: '' },
		{ name: '', phone: '' },
		{ name: '', phone: '' },
		{ name: '', phone: '' }
	]);

	// Reset the questionnaire state when component mounts
	useEffect(() => {
		setCurrentStep(0);
		setAnswers({});
	}, []);

	const handleOptionSelect = (questionId: number, optionId: string) => {
		setAnswers(prev => {
			const currentAnswers = prev[questionId] || [];
			const question = questions.find(q => q.id === questionId);
			
			if (question?.type === 'multiple') {
				const newAnswers = currentAnswers.includes(optionId)
					? currentAnswers.filter(id => id !== optionId)
					: [...currentAnswers, optionId];
				return { ...prev, [questionId]: newAnswers };
			} else {
				return { ...prev, [questionId]: [optionId] };
			}
		});
	};

	const handleNext = () => {
		if (currentStep < questions.length - 1) {
			setCurrentStep(prev => prev + 1);
		} else {
			// Show name modal first
			setShowNameModal(true);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const currentQ = questions[currentStep];

	const handleContactChange = (index: number, field: 'name' | 'phone', value: string) => {
		const newContacts = [...emergencyContacts];
		newContacts[index] = { ...newContacts[index], [field]: value };
		setEmergencyContacts(newContacts);
	};

	const handleNameModalClose = async () => {
		setIsLoading(true);

		const formattedContacts = emergencyContacts
			.filter(contact => contact.name && contact.phone)
			.map(contact => ({
				id: crypto.randomUUID(),
				name: contact.name,
				phone: contact.phone,
				email: ''
			}));

		const userPreferences = {
			answers,
			emergencyContacts: formattedContacts,
			timestamp: new Date().toISOString()
		};

		// Save to Supabase if authenticated
		const { data: { session } } = await supabase.auth.getSession();
		if (session) {
			await supabase
				.from('onboarding_answers')
				.insert<TablesInsert<'onboarding_answers'>>([
					{
						user_id: session.user.id,
						answers: userPreferences.answers,
						emergency_contacts: userPreferences.emergencyContacts
					}
				]);
			// Create or update profile for the user
			await supabase
				.from('profiles')
				.upsert([
					{
						id: session.user.id,
						email: session.user.email,
						created_at: new Date().toISOString()
					}
				]);
		} else {
			// Save to localStorage as fallback
			localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
			localStorage.setItem('emergencyContacts', JSON.stringify(formattedContacts));
		}

		localStorage.setItem('showAshaChatbot', 'true');

		setTimeout(() => {
			navigate('/dashboard');
		}, 3000);
	};

	if (isLoading) {
		return <LoadingAnimation />;
	}

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="min-h-screen bg-[#1A1A2E] text-white p-8"
			>
				<div className="max-w-2xl mx-auto">
					<div className="mb-8">
						<div className="w-full bg-gray-700 rounded-full h-2">
							<div
								className="bg-purple-500 h-2 rounded-full transition-all duration-300"
								style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
						/>
						</div>
					</div>
					
					{currentQ.type !== 'contacts' ? (
						<>
							<h2 className="text-3xl font-bold mb-8 text-center">
								{currentQ.text}
							</h2>
							<div className="space-y-4">
								{currentQ.options.map(option => (
									<motion.button
										key={option.id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => handleOptionSelect(currentQ.id, option.id)}
										className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
											(answers[currentQ.id] || []).includes(option.id)
												? 'bg-purple-600 border-2 border-purple-400'
												: 'bg-gray-800 hover:bg-gray-700'
										}`}
									>
										<span className="text-2xl mr-3">{option.emoji}</span>
										<span className="text-lg">{option.text}</span>
									</motion.button>
								))}
							</div>
						</>
					) : (
						<div className="space-y-6 max-w-2xl mx-auto">
							<div className="text-center space-y-4 mb-6">
								<h2 className="text-2xl font-bold">
									{currentQ.text}
								</h2>
								<p className="text-gray-300 text-sm">
									We'll only reach out in true emergencies
								</p>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{emergencyContacts.map((contact, index) => (
					<motion.div 
										key={index}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all duration-300"
					>
										<div className="flex items-center mb-3">
											<div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
												{index + 1}
											</div>
											<h3 className="ml-2 text-sm font-semibold text-white/80">Emergency Contact {index + 1}</h3>
										</div>
										<div className="space-y-2">
											<input
												type="text"
												placeholder="Name"
												value={contact.name}
												onChange={(e) => handleContactChange(index, 'name', e.target.value)}
												className="w-full p-2 text-sm rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:outline-none"
											/>
											<input
												type="tel"
												placeholder="Phone Number"
												value={contact.phone}
												onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
												className="w-full p-2 text-sm rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:outline-none"
											/>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					)}

					<div className="flex justify-between mt-8">
						{currentStep > 0 && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleBack}
								className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
						>
								Back
							</motion.button>
						)}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleNext}
							className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 ml-auto"
						>
							{currentStep < questions.length - 1 ? 'Next' : 'Complete'}
						</motion.button>
					</div>
				</div>
			</motion.div>

			<NameAshaModal 
				isOpen={showNameModal} 
				onClose={handleNameModalClose} 
			/>
		</>
	);
};