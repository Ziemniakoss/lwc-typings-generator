declare module "lightning/serviceCloudVoiceToolkitApi" {
	type CallType = "inbound" | "outbound";

	interface BaseCallEvent {
		/**
		 * Unique ID of the voice call within the telephony system. For example, if the telephony system is Amazon Connect, this value is the contact ID.
		 */
		callId: string;
	}

	interface BaseCallWithParticipant extends BaseCallEvent {
		/**
		 * the phone number
		 */
		participant: string;
	}

	interface CallStartedEvent extends BaseCallWithParticipant {
		callType: CallType;
	}

	interface CallConnectedEvent extends BaseCallWithParticipant {
		callType: CallType;
	}

	interface CallEndedEvent extends BaseCallEvent {}

	interface HoldEvent extends BaseCallWithParticipant {}

	interface ResumeEvent extends BaseCallWithParticipant {}

	interface MuteEvent extends BaseCallEvent {}

	interface UnMuteEvent extends BaseCallEvent {}

	interface ParticipantAddedEvent extends BaseCallWithParticipant {}

	interface ParticipantRemovedEvent extends BaseCallWithParticipant {}

	interface ConferenceEvent extends BaseCallEvent {}

	interface SwapEvent extends BaseCallEvent {}

	interface PauseRecordingEvent extends BaseCallEvent {}

	interface ResumeRecordingEvent extends BaseCallEvent {}

	interface WrapUpEndedEvent extends BaseCallEvent {}

	interface TranscriptEventContent {
		formatType: "Text";
		text: string;
	}

	type SenderRole = "Agent" | "Supervisor";

	interface TranscriptEventSender {
		role: SenderRole;
	}

	interface TranscriptEvent extends BaseCallEvent {
		/**
		 * Unique identifier for the message.
		 */
		id: string;
		/**
		 * The date and time (in UTC) when the client sent the content.
		 * Measured in milliseconds since the Unix epoch.
		 */
		clientSentTimestamp: number;
		/**
		 * The date and time (in UTC) when the server received the content.
		 * Measured in milliseconds since the Unix epoch.
		 */
		serverReceivedTimestamp: number;
		content: TranscriptEventContent;
		sender: TranscriptEventSender;
	}

	interface FlagRaiseEventContent {
		formatType: "Text";
		text: string;
	}

	interface FlagChangeEventSender {
		role: SenderRole;
		/**
		 * The name of the user whose action initiated the event
		 */
		displayName: string;
	}

	interface FlagRaiseEvent extends BaseCallEvent {
		/**
		 * Unique identifier for the message.
		 */
		id: string;
		/**
		 * The date and time (in UTC) when the client sent the content.
		 * Measured in milliseconds since the Unix epoch.
		 */
		clientSentTimestamp: number;
		/**
		 * The date and time (in UTC) when the server received the content.
		 * Measured in milliseconds since the Unix epoch.
		 */
		serverReceivedTimestamp: number;
		sender: FlagChangeEventSender;
		content: FlagRaiseEventContent;
	}

	interface FlagLowerEvent extends BaseCallEvent {
		/**
		 * Unique identifier for the message.
		 */
		id: string;
		/**
		 * The date and time (in UTC) when the client sent the content.
		 * Measured in milliseconds since the Unix epoch.
		 */
		clientSentTimestamp: number;
		/**
		 * The date and time (in UTC) when the server received the content.
		 * Measured in milliseconds since the Unix epoch.
		 */
		serverReceivedTimestamp: number;
		sender: FlagChangeEventSender;
		content: { formatText: null; text: null };
	}

	interface EventsMap {
		callstarted: CallStartedEvent;
		callconnected: CallConnectedEvent;
		callended: CallEndedEvent;
		hold: HoldEvent;
		resume: ResumeEvent;
		mute: MuteEvent;
		unmute: UnMuteEvent;
		participantadded: ParticipantAddedEvent;
		participantremoved: ParticipantRemovedEvent;
		conference: ConferenceEvent;
		swap: SwapEvent;
		pauserecording: PauseRecordingEvent;
		resumerecording: ResumeRecordingEvent;
		wrapupended: WrapUpEndedEvent;
		transcript: TranscriptEvent;
		flagraise: FlagRaiseEvent;
		flaglower: FlagLowerEvent;
	}

	interface Event<Name extends keyof EventsMap> {
		type: Name;
		detail: EventsMap[Name];
	}

	/**
	 * Useful links:
	 * - [documentation in component library](https://developer.salesforce.com/docs/component-library/bundle/lightning-service-cloud-voice-toolkit-api/documentation)
	 * - [events documentation](https://developer.salesforce.com/docs/atlas.en-us.voice_developer_guide.meta/voice_developer_guide/voice_lc_toolkit_telephony_lwc.htm)
	 * - [example implementation](https://github.com/service-cloud-voice/examples-from-doc/blob/main/ToolkitAPI/SampleLWCComponent/component.js)
	 */
	export default class ServiceCloudVoiceToolkitApi {
		addEventListener<T extends keyof EventsMap>(
			eventName: T,
			listener: (e: Event<T>) => any
		);
		removeEventListener<T extends keyof EventsMap>(
			eventName: T,
			listener: (e: Event<T>) => any
		);
	}
}
