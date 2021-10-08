#include "CommCoreModule.h"
#include "DatabaseManager.h"
#include "Logger.h"
#include "MessageStoreOperations.h"

#include <folly/Optional.h>

#include "../DatabaseManagers/entities/Media.h"

#include <ReactCommon/TurboModuleUtils.h>

namespace comm {

using namespace facebook::react;

jsi::Value CommCoreModule::getDraft(jsi::Runtime &rt, const jsi::String &key) {
  std::string keyStr = key.utf8(rt);
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          std::string draftStr;
          try {
            draftStr = DatabaseManager::getQueryExecutor().getDraft(keyStr);
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
              return;
            }
            jsi::String draft = jsi::String::createFromUtf8(innerRt, draftStr);
            promise->resolve(std::move(draft));
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value
CommCoreModule::updateDraft(jsi::Runtime &rt, const jsi::Object &draft) {
  std::string keyStr = draft.getProperty(rt, "key").asString(rt).utf8(rt);
  std::string textStr = draft.getProperty(rt, "text").asString(rt).utf8(rt);
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          try {
            DatabaseManager::getQueryExecutor().updateDraft(keyStr, textStr);
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
            } else {
              promise->resolve(true);
            }
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value CommCoreModule::moveDraft(
    jsi::Runtime &rt,
    const jsi::String &oldKey,
    const jsi::String &newKey) {
  std::string oldKeyStr = oldKey.utf8(rt);
  std::string newKeyStr = newKey.utf8(rt);

  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          bool result = false;
          try {
            result = DatabaseManager::getQueryExecutor().moveDraft(
                oldKeyStr, newKeyStr);
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
            } else {
              promise->resolve(result);
            }
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value CommCoreModule::getAllDrafts(jsi::Runtime &rt) {
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          std::vector<Draft> draftsVector;
          size_t numDrafts;
          try {
            draftsVector = DatabaseManager::getQueryExecutor().getAllDrafts();
            numDrafts = count_if(
                draftsVector.begin(), draftsVector.end(), [](Draft draft) {
                  return !draft.text.empty();
                });
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
              return;
            }
            jsi::Array jsiDrafts = jsi::Array(innerRt, numDrafts);

            size_t writeIndex = 0;
            for (Draft draft : draftsVector) {
              if (draft.text.empty()) {
                continue;
              }
              auto jsiDraft = jsi::Object(innerRt);
              jsiDraft.setProperty(innerRt, "key", draft.key);
              jsiDraft.setProperty(innerRt, "text", draft.text);
              jsiDrafts.setValueAtIndex(innerRt, writeIndex++, jsiDraft);
            }
            promise->resolve(std::move(jsiDrafts));
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value CommCoreModule::removeAllDrafts(jsi::Runtime &rt) {
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          try {
            DatabaseManager::getQueryExecutor().removeAllDrafts();
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
              return;
            }
            promise->resolve(jsi::Value::undefined());
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value CommCoreModule::removeAllMessages(jsi::Runtime &rt) {
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          try {
            DatabaseManager::getQueryExecutor().removeAllMessages();
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
              return;
            }
            promise->resolve(jsi::Value::undefined());
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value CommCoreModule::getAllMessages(jsi::Runtime &rt) {
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          std::vector<Message> messagesVector;
          size_t numMessages;
          try {
            messagesVector =
                DatabaseManager::getQueryExecutor().getAllMessages();
            numMessages = messagesVector.size();
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync(
              [&messagesVector, &innerRt, promise, error, numMessages]() {
                if (error.size()) {
                  promise->reject(error);
                  return;
                }
                jsi::Array jsiMessages = jsi::Array(innerRt, numMessages);
                size_t writeIndex = 0;
                for (const Message &message : messagesVector) {
                  auto jsiMessage = jsi::Object(innerRt);
                  jsiMessage.setProperty(innerRt, "id", message.id);

                  if (message.local_id) {
                    auto local_id = message.local_id.get();
                    jsiMessage.setProperty(innerRt, "local_id", *local_id);
                  }

                  jsiMessage.setProperty(innerRt, "thread", message.thread);
                  jsiMessage.setProperty(innerRt, "user", message.user);
                  jsiMessage.setProperty(
                      innerRt, "type", std::to_string(message.type));

                  if (message.future_type) {
                    auto future_type = message.future_type.get();
                    jsiMessage.setProperty(
                        innerRt, "future_type", std::to_string(*future_type));
                  }

                  if (message.content) {
                    auto content = message.content.get();
                    jsiMessage.setProperty(innerRt, "content", *content);
                  }

                  jsiMessage.setProperty(
                      innerRt, "time", std::to_string(message.time));
                  jsiMessages.setValueAtIndex(
                      innerRt, writeIndex++, jsiMessage);
                }
                promise->resolve(std::move(jsiMessages));
              });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

#define REKEY_OPERATION "rekey"
#define REMOVE_OPERATION "remove"
#define REPLACE_OPERATION "replace"
#define REMOVE_MSGS_FOR_THREADS_OPERATION "remove_messages_for_threads"

jsi::Value CommCoreModule::processMessageStoreOperations(
    jsi::Runtime &rt,
    const jsi::Array &operations) {

  std::vector<std::shared_ptr<MessageStoreOperationBase>> messageStoreOps;

  for (auto idx = 0; idx < operations.size(rt); idx++) {
    auto op = operations.getValueAtIndex(rt, idx).asObject(rt);
    auto op_type = op.getProperty(rt, "type").asString(rt).utf8(rt);

    if (op_type == REMOVE_OPERATION) {
      std::vector<std::string> removed_msg_ids;
      auto payload_obj = op.getProperty(rt, "payload").asObject(rt);
      auto msg_ids =
          payload_obj.getProperty(rt, "ids").asObject(rt).asArray(rt);
      for (auto msg_idx = 0; msg_idx < msg_ids.size(rt); msg_idx++) {
        removed_msg_ids.push_back(
            msg_ids.getValueAtIndex(rt, msg_idx).asString(rt).utf8(rt));
      }
      messageStoreOps.push_back(std::make_shared<RemoveMessagesOperation>(
          std::move(removed_msg_ids)));

    } else if (op_type == REMOVE_MSGS_FOR_THREADS_OPERATION) {
      std::vector<std::string> threads_to_remove_msgs_from;
      auto payload_obj = op.getProperty(rt, "payload").asObject(rt);
      auto thread_ids =
          payload_obj.getProperty(rt, "threadIDs").asObject(rt).asArray(rt);
      for (auto thread_idx = 0; thread_idx < thread_ids.size(rt);
           thread_idx++) {
        threads_to_remove_msgs_from.push_back(
            thread_ids.getValueAtIndex(rt, thread_idx).asString(rt).utf8(rt));
      }
      messageStoreOps.push_back(
          std::make_shared<RemoveMessagesForThreadsOperation>(
              std::move(threads_to_remove_msgs_from)));
    } else if (op_type == REPLACE_OPERATION) {
      auto msg_obj = op.getProperty(rt, "payload").asObject(rt);
      auto msg_id = msg_obj.getProperty(rt, "id").asString(rt).utf8(rt);

      auto maybe_local_id = msg_obj.getProperty(rt, "local_id");
      auto local_id = maybe_local_id.isString()
          ? std::make_unique<std::string>(maybe_local_id.asString(rt).utf8(rt))
          : nullptr;

      auto thread = msg_obj.getProperty(rt, "thread").asString(rt).utf8(rt);
      auto user = msg_obj.getProperty(rt, "user").asString(rt).utf8(rt);
      auto type =
          std::stoi(msg_obj.getProperty(rt, "type").asString(rt).utf8(rt));

      auto maybe_future_type = msg_obj.getProperty(rt, "future_type");
      auto future_type = maybe_future_type.isString()
          ? std::make_unique<int>(
                std::stoi(maybe_future_type.asString(rt).utf8(rt)))
          : nullptr;

      auto maybe_content = msg_obj.getProperty(rt, "content");
      auto content = maybe_content.isString()
          ? std::make_unique<std::string>(maybe_content.asString(rt).utf8(rt))
          : nullptr;

      auto time =
          std::stoll(msg_obj.getProperty(rt, "time").asString(rt).utf8(rt));
      Message message{
          msg_id,
          std::move(local_id),
          thread,
          user,
          type,
          std::move(future_type),
          std::move(content),
          time};

      std::vector<Media> media_vector;
      if (msg_obj.getProperty(rt, "media_infos").isObject()) {
        auto media_infos =
            msg_obj.getProperty(rt, "media_infos").asObject(rt).asArray(rt);
        for (auto media_info_idx = 0; media_info_idx < media_infos.size(rt);
             media_info_idx++) {
          auto media_info =
              media_infos.getValueAtIndex(rt, media_info_idx).asObject(rt);
          auto media_id =
              media_info.getProperty(rt, "id").asString(rt).utf8(rt);
          auto media_uri =
              media_info.getProperty(rt, "uri").asString(rt).utf8(rt);
          auto media_type =
              media_info.getProperty(rt, "type").asString(rt).utf8(rt);
          auto media_extras =
              media_info.getProperty(rt, "extras").asString(rt).utf8(rt);

          Media media{
              media_id, msg_id, thread, media_uri, media_type, media_extras};
          media_vector.push_back(media);
        }
      }

      messageStoreOps.push_back(std::make_shared<ReplaceMessageOperation>(
          std::move(message), std::move(media_vector)));
    } else if (op_type == REKEY_OPERATION) {
      auto rekey_payload = op.getProperty(rt, "payload").asObject(rt);
      auto from = rekey_payload.getProperty(rt, "from").asString(rt).utf8(rt);
      auto to = rekey_payload.getProperty(rt, "to").asString(rt).utf8(rt);
      messageStoreOps.push_back(std::make_shared<RekeyMessageOperation>(
          std::move(from), std::move(to)));
    } else {
      return createPromiseAsJSIValue(
          rt,
          [this,
           op_type](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
            this->jsInvoker_->invokeAsync([promise, &innerRt, op_type]() {
              promise->reject(
                  std::string{"unsupported operation: "}.append(op_type));
            });
          });
    }
  }

  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) mutable {
        taskType job = [=, &innerRt]() {
          std::string error;
          try {
            DatabaseManager::getQueryExecutor().beginTransaction();
            for (const auto &operation : messageStoreOps) {
              operation->execute();
            }
            DatabaseManager::getQueryExecutor().commitTransaction();
          } catch (std::system_error &e) {
            error = e.what();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
            } else {
              promise->resolve(jsi::Value::undefined());
            }
          });
        };
        this->scheduleOrRun(this->databaseThread, job);
      });
}

jsi::Value CommCoreModule::initializeCryptoAccount(
    jsi::Runtime &rt,
    const jsi::String &userId) {
  std::string userIdStr = userId.utf8(rt);
  folly::Optional<std::string> storedSecretKey =
      this->secureStore.get(this->secureStoreAccountDataKey);
  if (!storedSecretKey.hasValue()) {
    storedSecretKey = crypto::Tools::generateRandomString(64);
    this->secureStore.set(
        this->secureStoreAccountDataKey, storedSecretKey.value());
  }

  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        this->scheduleOrRun(this->databaseThread, [=, &innerRt]() {
          crypto::Persist persist;
          std::string error;
          try {
            folly::Optional<std::string> accountData =
                DatabaseManager::getQueryExecutor().getOlmPersistAccountData();
            if (accountData.hasValue()) {
              persist.account =
                  crypto::OlmBuffer(accountData->begin(), accountData->end());
              // handle sessions data
              std::vector<OlmPersistSession> sessionsData =
                  DatabaseManager::getQueryExecutor()
                      .getOlmPersistSessionsData();
              for (OlmPersistSession &sessionsDataItem : sessionsData) {
                crypto::OlmBuffer sessionDataBuffer(
                    sessionsDataItem.session_data.begin(),
                    sessionsDataItem.session_data.end());
                persist.sessions.insert(std::make_pair(
                    sessionsDataItem.target_user_id, sessionDataBuffer));
              }
            }
          } catch (std::system_error &e) {
            error = e.what();
          }

          this->scheduleOrRun(this->cryptoThread, [=, &innerRt]() {
            std::string error;
            this->cryptoModule.reset(new crypto::CryptoModule(
                userIdStr, storedSecretKey.value(), persist));
            if (persist.isEmpty()) {
              crypto::Persist newPersist =
                  this->cryptoModule->storeAsB64(storedSecretKey.value());
              this->scheduleOrRun(this->databaseThread, [=, &innerRt]() {
                std::string error;
                try {
                  DatabaseManager::getQueryExecutor().storeOlmPersistData(
                      newPersist);
                } catch (std::system_error &e) {
                  error = e.what();
                }
                this->jsInvoker_->invokeAsync([=, &innerRt]() {
                  if (error.size()) {
                    promise->reject(error);
                    return;
                  }
                  promise->resolve(jsi::Value::undefined());
                });
              });

            } else {
              this->cryptoModule->restoreFromB64(
                  storedSecretKey.value(), persist);
              this->jsInvoker_->invokeAsync([=, &innerRt]() {
                if (error.size()) {
                  promise->reject(error);
                  return;
                }
                promise->resolve(jsi::Value::undefined());
              });
            }
          });
        });
      });
}

void CommCoreModule::initializeNetworkModule(
    const std::string &userId,
    const std::string &deviceToken,
    const std::string &hostname) {
  std::string host = (hostname.size() == 0) ? "localhost" : hostname;
  // initialize network module
  // this is going to differ depending on a device
  // 10.0.2.2 for android emulator
  // 192.168.x.x for a physical device etc
  const std::shared_ptr<grpc::ChannelCredentials> credentials =
      (host.substr(0, 5) == "https")
      ? grpc::SslCredentials(grpc::SslCredentialsOptions())
      : grpc::InsecureChannelCredentials();
  this->networkClient.reset(
      new network::Client(host, "50051", credentials, userId, deviceToken));
}

jsi::Value CommCoreModule::getUserPublicKey(jsi::Runtime &rt) {
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          std::string result;
          if (this->cryptoModule == nullptr) {
            error = "user has not been initialized";
          } else {
            result = this->cryptoModule->getIdentityKeys();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
              return;
            }
            promise->resolve(jsi::String::createFromUtf8(innerRt, result));
          });
        };
        this->scheduleOrRun(this->cryptoThread, job);
      });
}

jsi::Value CommCoreModule::getUserOneTimeKeys(jsi::Runtime &rt) {
  return createPromiseAsJSIValue(
      rt, [=](jsi::Runtime &innerRt, std::shared_ptr<Promise> promise) {
        taskType job = [=, &innerRt]() {
          std::string error;
          std::string result;
          if (this->cryptoModule == nullptr) {
            error = "user has not been initialized";
          } else {
            result = this->cryptoModule->getOneTimeKeys();
          }
          this->jsInvoker_->invokeAsync([=, &innerRt]() {
            if (error.size()) {
              promise->reject(error);
              return;
            }
            promise->resolve(jsi::String::createFromUtf8(innerRt, result));
          });
        };
        this->scheduleOrRun(this->cryptoThread, job);
      });
}

void CommCoreModule::scheduleOrRun(
    const std::unique_ptr<WorkerThread> &thread,
    const taskType &task) {
  if (thread != nullptr) {
    thread->scheduleTask(task);
  } else {
    task();
  }
}

void CommCoreModule::initializeThreads() {
  if (this->databaseThread == nullptr) {
    this->databaseThread = std::make_unique<WorkerThread>("database");
  }
  if (this->cryptoThread == nullptr) {
    this->cryptoThread = std::make_unique<WorkerThread>("crypto");
  }
  if (this->networkThread == nullptr) {
    this->networkThread = std::make_unique<WorkerThread>("network");
  }
}

CommCoreModule::CommCoreModule(
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker)
    : facebook::react::CommCoreModuleSchemaCxxSpecJSI(jsInvoker),
      databaseThread(nullptr),
      cryptoThread(nullptr),
      networkThread(nullptr) {
  this->initializeThreads();
};

} // namespace comm
