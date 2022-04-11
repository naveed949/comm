#include "DatabaseManager.h"
#include "ConfigManager.h"
#include "Constants.h"
#include "Tools.h"

#include <gtest/gtest.h>

#include <ctime>
#include <memory>
#include <string>

using namespace comm::network;

class DatabaseManagerTest : public testing::Test {
protected:
  virtual void SetUp() {
    config::ConfigManager::getInstance().load();
    Aws::InitAPI({});
  }

  virtual void TearDown() {
    Aws::ShutdownAPI({});
  }
};

TEST_F(DatabaseManagerTest, PutAndFoundMessageItemsStaticDataIsSame) {
  const database::MessageItem item(
      "bc0c1aa2-bf09-11ec-9d64-0242ac120002",
      "mobile:EMQNoQ7b2ueEmQ4QsevRWlXxFCNt055y20T1PHdoYAQRt0S6TLzZWNM6XSvdWqxm",
      "web:JouLWf84zqRIsjBdHLOcHS9M4eSCz7VF84wT1uOD83u1qxDAqmqI4swmxNINjuhd",
      "lYlNcO6RR4i9UW3G1DGjdJTRRGbqtPya2aj94ZRjIGZWoHwT5MB9ciAgnQf2VafYb9Tl"
      "8SZkX37tg4yZ9pOb4lqslY4g4h58OmWjumghVRvrPUZDalUuK8OLs1Qoengpu9wccxAk"
      "Bti2leDTNeiJDy36NnwS9aCIUc0ozsMvXfX1gWdBdmKbiRG1LvpNd6S7BNGG7Zly5zYj"
      "xz7s6ZUSDoFfZe3eJWQ15ngYhgMw1TsfbECnMVQTYvY6OyqWPBQi5wiftFcluoxor8G5"
      "RJ1NEDQq2q2FRfWjNHLhky92C2C7Nnfe4oVzSinfC1319uUkNLpSzI4MvEMi6g5Ukbl7"
      "iGhpnX7Hp4xpBL3h2IkvGviDRQ98UvW0ugwUuPxm1NOQpjLG5dPoqQ0jrMst0Bl5rgPw"
      "ajjNGsUWmp9r0ST0wRQXrQcY30PoSoqKSlCEgFMLzHWLrPQ86QFyCICismGSe7iBIqdD"
      "6d37StvXBzfJoZVU79UeOF2bFvb3DNoArEOe",
      "7s6ZUSDoFfZe3eJWQ15ngYhgMw1TsfbECnMVQTYvY6OyqWPBQi5wiftFcluoxor8",
      static_cast<uint64_t>(std::time(0)) + 600);
  EXPECT_EQ(
      database::DatabaseManager::getInstance().isTableAvailable(
          item.getTableName()),
      true);
  database::DatabaseManager::getInstance().putMessageItem(item);
  std::shared_ptr<database::MessageItem> foundItem =
      database::DatabaseManager::getInstance().findMessageItem(
          item.getMessageID());
  EXPECT_NE(foundItem, nullptr);
  EXPECT_EQ(item.getFromDeviceID(), foundItem->getFromDeviceID());
  EXPECT_EQ(item.getToDeviceID(), foundItem->getToDeviceID());
  EXPECT_EQ(item.getPayload(), foundItem->getPayload());
  EXPECT_EQ(item.getBlobHashes(), foundItem->getBlobHashes());
  EXPECT_EQ(item.getExpire(), foundItem->getExpire());
  database::DatabaseManager::getInstance().removeMessageItem(
      item.getMessageID());
}

TEST_F(DatabaseManagerTest, PutAndFoundMessageItemsGeneratedDataIsSame) {
  const database::MessageItem item(
      tools::generateUUID(),
      "mobile:" + tools::generateRandomString(DEVICEID_CHAR_LENGTH),
      "web:" + tools::generateRandomString(DEVICEID_CHAR_LENGTH),
      tools::generateRandomString(256),
      tools::generateRandomString(256),
      static_cast<uint64_t>(std::time(0)) + 600);
  EXPECT_EQ(
      database::DatabaseManager::getInstance().isTableAvailable(
          item.getTableName()),
      true);
  database::DatabaseManager::getInstance().putMessageItem(item);
  std::shared_ptr<database::MessageItem> foundItem =
      database::DatabaseManager::getInstance().findMessageItem(
          item.getMessageID());
  EXPECT_NE(foundItem, nullptr);
  EXPECT_EQ(item.getFromDeviceID(), foundItem->getFromDeviceID())
      << "Generated FromDeviceID \"" << item.getFromDeviceID()
      << "\" differs from what is found in the database "
      << foundItem->getFromDeviceID();
  EXPECT_EQ(item.getToDeviceID(), foundItem->getToDeviceID())
      << "Generated ToDeviceID \"" << item.getToDeviceID()
      << "\" differs from what is found in the database "
      << foundItem->getToDeviceID();
  EXPECT_EQ(item.getPayload(), foundItem->getPayload())
      << "Generated Payload \"" << item.getPayload()
      << "\" differs from what is found in the database "
      << foundItem->getPayload();
  EXPECT_EQ(item.getBlobHashes(), foundItem->getBlobHashes())
      << "Generated BlobHashes \"" << item.getBlobHashes()
      << "\" differs from what is found in the database "
      << foundItem->getBlobHashes();
  EXPECT_EQ(item.getExpire(), foundItem->getExpire())
      << "Generated Expire time \"" << item.getExpire()
      << "\" differs from what is found in the database "
      << foundItem->getExpire();
  database::DatabaseManager::getInstance().removeMessageItem(
      item.getMessageID());
}

TEST_F(DatabaseManagerTest, TestOperationsOnDeviceSessionItem) {
  const database::DeviceSessionItem item(
      "bc0c1aa2-bf09-11ec-9d64-0242ac120002",
      "mobile:EMQNoQ7b2ueEmQ4QsevRWlXxFCNt055y20T1PHdoYAQRt0S6TLzZWNM6XSvdWqxm",
      "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9Q9wodsQdZNynbTnC35hA4mFW"
      "mwZf9BhbI93aGAwPF9au0eYsawRz0jtYi4lSFXC9KleyQDg+6J+UW1kiWvE3ZRYG"
      "ECqgx4zqajPTzVt7EAOGaIh/dPyQ6x2Ul1GlkkSYXUhhixEzExGp9g84eCyVkbCB"
      "U3SK6SNKyR7anAXDVQIDAQAB",
      "hbI93aGAwPF9au0eYsawRz0jtYi4lSFXC9KleyQDg+6J+UW1kiWvE3",
      "phone",
      "ios:1.1.1",
      "iOS 99.99.99");
  EXPECT_EQ(
      database::DatabaseManager::getInstance().isTableAvailable(
          item.getTableName()),
      true);
  database::DatabaseManager::getInstance().putSessionItem(item);
  std::shared_ptr<database::DeviceSessionItem> foundItem =
      database::DatabaseManager::getInstance().findSessionItem(
          item.getSessionID());
  EXPECT_NE(foundItem, nullptr);
  EXPECT_EQ(item.getDeviceID(), foundItem->getDeviceID());
  EXPECT_EQ(item.getPubKey(), foundItem->getPubKey());
  EXPECT_EQ(item.getNotifyToken(), foundItem->getNotifyToken());
  EXPECT_EQ(item.getDeviceType(), foundItem->getDeviceType());
  EXPECT_EQ(item.getAppVersion(), foundItem->getAppVersion());
  EXPECT_EQ(item.getDeviceOs(), foundItem->getDeviceOs());
  database::DatabaseManager::getInstance().removeSessionItem(
      item.getSessionID());
}

TEST_F(DatabaseManagerTest, TestOperationsOnDeviceSessionItemGenerated) {
  const database::DeviceSessionItem item(
      tools::generateUUID(),
      "mobile:" + tools::generateRandomString(DEVICEID_CHAR_LENGTH),
      tools::generateRandomString(451),
      tools::generateRandomString(64),
      tools::generateRandomString(12),
      tools::generateRandomString(12),
      tools::generateRandomString(12));
  EXPECT_EQ(
      database::DatabaseManager::getInstance().isTableAvailable(
          item.getTableName()),
      true);
  database::DatabaseManager::getInstance().putSessionItem(item);
  std::shared_ptr<database::DeviceSessionItem> foundItem =
      database::DatabaseManager::getInstance().findSessionItem(
          item.getSessionID());
  EXPECT_NE(foundItem, nullptr);
  EXPECT_EQ(item.getDeviceID(), foundItem->getDeviceID())
      << "Generated DeviceID \"" << item.getDeviceID()
      << "\" differs from what is found in the database "
      << foundItem->getDeviceID();
  EXPECT_EQ(item.getPubKey(), foundItem->getPubKey())
      << "Generated PubKey \"" << item.getPubKey()
      << "\" differs from what is found in the database "
      << foundItem->getPubKey();
  EXPECT_EQ(item.getNotifyToken(), foundItem->getNotifyToken())
      << "Generated NotifyToken \"" << item.getNotifyToken()
      << "\" differs from what is found in the database "
      << foundItem->getNotifyToken();
  EXPECT_EQ(item.getDeviceType(), foundItem->getDeviceType())
      << "Generated DeviceType \"" << item.getDeviceType()
      << "\" differs from what is found in the database "
      << foundItem->getDeviceType();
  EXPECT_EQ(item.getAppVersion(), foundItem->getAppVersion())
      << "Generated AppVersion \"" << item.getAppVersion()
      << "\" differs from what is found in the database "
      << foundItem->getAppVersion();
  EXPECT_EQ(item.getDeviceOs(), foundItem->getDeviceOs())
      << "Generated DeviceOS \"" << item.getDeviceOs()
      << "\" differs from what is found in the database "
      << foundItem->getDeviceOs();
  database::DatabaseManager::getInstance().removeSessionItem(
      item.getSessionID());
}
