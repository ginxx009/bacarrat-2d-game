namespace B2DGAME {

    export interface IMessageHandler {

        onMessage(message: Message): void;
    }
}