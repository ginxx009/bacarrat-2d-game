namespace B2DGAME {

    export class MessageBus {

        private static _subscription: { [code: string]: IMessageHandler[] } = {};

        private static _normalQueueMessagePerUpdate: number = 10;
        private static _NormalMessageQueue: MessageSubscriptionNode[] = [];

        private constructor() {

        }

        public static addSubscription(code: string, handler: IMessageHandler): void {
            if (MessageBus._subscription[code] === undefined) {
                MessageBus._subscription[code] = [];
            }

            if (MessageBus._subscription[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". Subscription not added!");
            } else {
                MessageBus._subscription[code].push(handler);
            }
        }

        public static RemoveSubscription(code: string, handler: IMessageHandler): void {
            if (MessageBus._subscription[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + ". Because that code is not subscribe to!");
                return;
            }

            let nodeIndex = MessageBus._subscription[code].indexOf(handler);
            if (nodeIndex !== -1) {
                MessageBus._subscription[code].splice(nodeIndex, 1);
            }
        }

        public static post(message: Message): void {
            console.log("Message Posted: ", message);
            let handlers = MessageBus._subscription[message.code];
            if (handlers === undefined) {
                return;
            }

            for (let h of handlers) {
                if (message.priority === MessagePriority.HIGH) {
                    h.onMessage(message);
                } else {
                    MessageBus._NormalMessageQueue.push(new MessageSubscriptionNode(message, h));
                }
            }
        }

        public static update(time:number):void {
            if (MessageBus._NormalMessageQueue.length === 0) {
                return;
            }

            let messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._NormalMessageQueue.length);

            for (let i = 0; i < messageLimit; ++i) {
                let node = MessageBus._NormalMessageQueue.pop();
                node.handler.onMessage(node.message);
            }
        }
    }
}