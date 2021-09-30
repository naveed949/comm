// @generated by the gRPC C++ plugin.
// If you make any local change, they will be lost.
// source: tunnelbroker.proto

#include "tunnelbroker.pb.h"
#include "tunnelbroker.grpc.pb.h"

#include <functional>
#include <grpcpp/impl/codegen/async_stream.h>
#include <grpcpp/impl/codegen/async_unary_call.h>
#include <grpcpp/impl/codegen/channel_interface.h>
#include <grpcpp/impl/codegen/client_unary_call.h>
#include <grpcpp/impl/codegen/client_callback.h>
#include <grpcpp/impl/codegen/message_allocator.h>
#include <grpcpp/impl/codegen/method_handler.h>
#include <grpcpp/impl/codegen/rpc_service_method.h>
#include <grpcpp/impl/codegen/server_callback.h>
#include <grpcpp/impl/codegen/server_callback_handlers.h>
#include <grpcpp/impl/codegen/server_context.h>
#include <grpcpp/impl/codegen/service_type.h>
#include <grpcpp/impl/codegen/sync_stream.h>
namespace tunnelbroker {

static const char* TunnelBrokerService_method_names[] = {
  "/tunnelbroker.TunnelBrokerService/CheckIfPrimaryDeviceOnline",
  "/tunnelbroker.TunnelBrokerService/BecomeNewPrimaryDevice",
  "/tunnelbroker.TunnelBrokerService/SendPong",
};

std::unique_ptr< TunnelBrokerService::Stub> TunnelBrokerService::NewStub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options) {
  (void)options;
  std::unique_ptr< TunnelBrokerService::Stub> stub(new TunnelBrokerService::Stub(channel, options));
  return stub;
}

TunnelBrokerService::Stub::Stub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options)
  : channel_(channel), rpcmethod_CheckIfPrimaryDeviceOnline_(TunnelBrokerService_method_names[0], options.suffix_for_stats(),::grpc::internal::RpcMethod::NORMAL_RPC, channel)
  , rpcmethod_BecomeNewPrimaryDevice_(TunnelBrokerService_method_names[1], options.suffix_for_stats(),::grpc::internal::RpcMethod::NORMAL_RPC, channel)
  , rpcmethod_SendPong_(TunnelBrokerService_method_names[2], options.suffix_for_stats(),::grpc::internal::RpcMethod::NORMAL_RPC, channel)
  {}

::grpc::Status TunnelBrokerService::Stub::CheckIfPrimaryDeviceOnline(::grpc::ClientContext* context, const ::tunnelbroker::CheckRequest& request, ::tunnelbroker::CheckResponse* response) {
  return ::grpc::internal::BlockingUnaryCall< ::tunnelbroker::CheckRequest, ::tunnelbroker::CheckResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), rpcmethod_CheckIfPrimaryDeviceOnline_, context, request, response);
}

void TunnelBrokerService::Stub::async::CheckIfPrimaryDeviceOnline(::grpc::ClientContext* context, const ::tunnelbroker::CheckRequest* request, ::tunnelbroker::CheckResponse* response, std::function<void(::grpc::Status)> f) {
  ::grpc::internal::CallbackUnaryCall< ::tunnelbroker::CheckRequest, ::tunnelbroker::CheckResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_CheckIfPrimaryDeviceOnline_, context, request, response, std::move(f));
}

void TunnelBrokerService::Stub::async::CheckIfPrimaryDeviceOnline(::grpc::ClientContext* context, const ::tunnelbroker::CheckRequest* request, ::tunnelbroker::CheckResponse* response, ::grpc::ClientUnaryReactor* reactor) {
  ::grpc::internal::ClientCallbackUnaryFactory::Create< ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_CheckIfPrimaryDeviceOnline_, context, request, response, reactor);
}

::grpc::ClientAsyncResponseReader< ::tunnelbroker::CheckResponse>* TunnelBrokerService::Stub::PrepareAsyncCheckIfPrimaryDeviceOnlineRaw(::grpc::ClientContext* context, const ::tunnelbroker::CheckRequest& request, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncResponseReaderHelper::Create< ::tunnelbroker::CheckResponse, ::tunnelbroker::CheckRequest, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), cq, rpcmethod_CheckIfPrimaryDeviceOnline_, context, request);
}

::grpc::ClientAsyncResponseReader< ::tunnelbroker::CheckResponse>* TunnelBrokerService::Stub::AsyncCheckIfPrimaryDeviceOnlineRaw(::grpc::ClientContext* context, const ::tunnelbroker::CheckRequest& request, ::grpc::CompletionQueue* cq) {
  auto* result =
    this->PrepareAsyncCheckIfPrimaryDeviceOnlineRaw(context, request, cq);
  result->StartCall();
  return result;
}

::grpc::Status TunnelBrokerService::Stub::BecomeNewPrimaryDevice(::grpc::ClientContext* context, const ::tunnelbroker::NewPrimaryRequest& request, ::tunnelbroker::NewPrimaryResponse* response) {
  return ::grpc::internal::BlockingUnaryCall< ::tunnelbroker::NewPrimaryRequest, ::tunnelbroker::NewPrimaryResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), rpcmethod_BecomeNewPrimaryDevice_, context, request, response);
}

void TunnelBrokerService::Stub::async::BecomeNewPrimaryDevice(::grpc::ClientContext* context, const ::tunnelbroker::NewPrimaryRequest* request, ::tunnelbroker::NewPrimaryResponse* response, std::function<void(::grpc::Status)> f) {
  ::grpc::internal::CallbackUnaryCall< ::tunnelbroker::NewPrimaryRequest, ::tunnelbroker::NewPrimaryResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_BecomeNewPrimaryDevice_, context, request, response, std::move(f));
}

void TunnelBrokerService::Stub::async::BecomeNewPrimaryDevice(::grpc::ClientContext* context, const ::tunnelbroker::NewPrimaryRequest* request, ::tunnelbroker::NewPrimaryResponse* response, ::grpc::ClientUnaryReactor* reactor) {
  ::grpc::internal::ClientCallbackUnaryFactory::Create< ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_BecomeNewPrimaryDevice_, context, request, response, reactor);
}

::grpc::ClientAsyncResponseReader< ::tunnelbroker::NewPrimaryResponse>* TunnelBrokerService::Stub::PrepareAsyncBecomeNewPrimaryDeviceRaw(::grpc::ClientContext* context, const ::tunnelbroker::NewPrimaryRequest& request, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncResponseReaderHelper::Create< ::tunnelbroker::NewPrimaryResponse, ::tunnelbroker::NewPrimaryRequest, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), cq, rpcmethod_BecomeNewPrimaryDevice_, context, request);
}

::grpc::ClientAsyncResponseReader< ::tunnelbroker::NewPrimaryResponse>* TunnelBrokerService::Stub::AsyncBecomeNewPrimaryDeviceRaw(::grpc::ClientContext* context, const ::tunnelbroker::NewPrimaryRequest& request, ::grpc::CompletionQueue* cq) {
  auto* result =
    this->PrepareAsyncBecomeNewPrimaryDeviceRaw(context, request, cq);
  result->StartCall();
  return result;
}

::grpc::Status TunnelBrokerService::Stub::SendPong(::grpc::ClientContext* context, const ::tunnelbroker::PongRequest& request, ::tunnelbroker::PongResponse* response) {
  return ::grpc::internal::BlockingUnaryCall< ::tunnelbroker::PongRequest, ::tunnelbroker::PongResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), rpcmethod_SendPong_, context, request, response);
}

void TunnelBrokerService::Stub::async::SendPong(::grpc::ClientContext* context, const ::tunnelbroker::PongRequest* request, ::tunnelbroker::PongResponse* response, std::function<void(::grpc::Status)> f) {
  ::grpc::internal::CallbackUnaryCall< ::tunnelbroker::PongRequest, ::tunnelbroker::PongResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_SendPong_, context, request, response, std::move(f));
}

void TunnelBrokerService::Stub::async::SendPong(::grpc::ClientContext* context, const ::tunnelbroker::PongRequest* request, ::tunnelbroker::PongResponse* response, ::grpc::ClientUnaryReactor* reactor) {
  ::grpc::internal::ClientCallbackUnaryFactory::Create< ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_SendPong_, context, request, response, reactor);
}

::grpc::ClientAsyncResponseReader< ::tunnelbroker::PongResponse>* TunnelBrokerService::Stub::PrepareAsyncSendPongRaw(::grpc::ClientContext* context, const ::tunnelbroker::PongRequest& request, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncResponseReaderHelper::Create< ::tunnelbroker::PongResponse, ::tunnelbroker::PongRequest, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), cq, rpcmethod_SendPong_, context, request);
}

::grpc::ClientAsyncResponseReader< ::tunnelbroker::PongResponse>* TunnelBrokerService::Stub::AsyncSendPongRaw(::grpc::ClientContext* context, const ::tunnelbroker::PongRequest& request, ::grpc::CompletionQueue* cq) {
  auto* result =
    this->PrepareAsyncSendPongRaw(context, request, cq);
  result->StartCall();
  return result;
}

TunnelBrokerService::Service::Service() {
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      TunnelBrokerService_method_names[0],
      ::grpc::internal::RpcMethod::NORMAL_RPC,
      new ::grpc::internal::RpcMethodHandler< TunnelBrokerService::Service, ::tunnelbroker::CheckRequest, ::tunnelbroker::CheckResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(
          [](TunnelBrokerService::Service* service,
             ::grpc::ServerContext* ctx,
             const ::tunnelbroker::CheckRequest* req,
             ::tunnelbroker::CheckResponse* resp) {
               return service->CheckIfPrimaryDeviceOnline(ctx, req, resp);
             }, this)));
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      TunnelBrokerService_method_names[1],
      ::grpc::internal::RpcMethod::NORMAL_RPC,
      new ::grpc::internal::RpcMethodHandler< TunnelBrokerService::Service, ::tunnelbroker::NewPrimaryRequest, ::tunnelbroker::NewPrimaryResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(
          [](TunnelBrokerService::Service* service,
             ::grpc::ServerContext* ctx,
             const ::tunnelbroker::NewPrimaryRequest* req,
             ::tunnelbroker::NewPrimaryResponse* resp) {
               return service->BecomeNewPrimaryDevice(ctx, req, resp);
             }, this)));
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      TunnelBrokerService_method_names[2],
      ::grpc::internal::RpcMethod::NORMAL_RPC,
      new ::grpc::internal::RpcMethodHandler< TunnelBrokerService::Service, ::tunnelbroker::PongRequest, ::tunnelbroker::PongResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(
          [](TunnelBrokerService::Service* service,
             ::grpc::ServerContext* ctx,
             const ::tunnelbroker::PongRequest* req,
             ::tunnelbroker::PongResponse* resp) {
               return service->SendPong(ctx, req, resp);
             }, this)));
}

TunnelBrokerService::Service::~Service() {
}

::grpc::Status TunnelBrokerService::Service::CheckIfPrimaryDeviceOnline(::grpc::ServerContext* context, const ::tunnelbroker::CheckRequest* request, ::tunnelbroker::CheckResponse* response) {
  (void) context;
  (void) request;
  (void) response;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}

::grpc::Status TunnelBrokerService::Service::BecomeNewPrimaryDevice(::grpc::ServerContext* context, const ::tunnelbroker::NewPrimaryRequest* request, ::tunnelbroker::NewPrimaryResponse* response) {
  (void) context;
  (void) request;
  (void) response;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}

::grpc::Status TunnelBrokerService::Service::SendPong(::grpc::ServerContext* context, const ::tunnelbroker::PongRequest* request, ::tunnelbroker::PongResponse* response) {
  (void) context;
  (void) request;
  (void) response;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}


}  // namespace tunnelbroker

