import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/orders',
})
export class OrderEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('branch:subscribe')
  handleBranchSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { branchId: string },
  ) {
    client.join(`branch:${payload.branchId}`)
    console.log(`[WS] Client ${client.id} subscribed to branch:${payload.branchId}`)
  }

  @SubscribeMessage('order:subscribe')
  handleOrderSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderId: string },
  ) {
    client.join(`order:${payload.orderId}`)
    console.log(`[WS] Client ${client.id} subscribed to order:${payload.orderId}`)
  }

  emitNewOrder(branchId: string, orderData: object) {
    this.server.to(`branch:${branchId}`).emit('order:new', orderData)
  }

  emitStatusChanged(orderId: string, branchId: string, orderData: object) {
    this.server.to(`order:${orderId}`).emit('order:status-changed', orderData)
    this.server.to(`branch:${branchId}`).emit('order:status-changed', orderData)
  }
}
