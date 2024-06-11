-- Create faculty table
CREATE TABLE faculty (
    facultyId SERIAL PRIMARY KEY,
    facultyName VARCHAR(255) NOT NULL
);

-- Create department table
CREATE TABLE department (
    departmentId SERIAL PRIMARY KEY,
    departmentName VARCHAR(255) NOT NULL,
    facultyId INTEGER REFERENCES faculty(facultyId) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE users (
    userId SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userName VARCHAR(255) NOT NULL,
    userYear INTEGER CHECK (userYear BETWEEN 0 AND 8),
    departmentId INTEGER REFERENCES department(departmentId) ON DELETE SET NULL,
    photoURL VARCHAR(255),
    userBio VARCHAR(255)
);

-- Create profile table
CREATE TABLE profile (
    profileId SERIAL PRIMARY KEY,
    userId INTEGER UNIQUE REFERENCES users(userId) ON DELETE CASCADE,
    theme VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create channels table
CREATE TABLE channels (
    channelId SERIAL PRIMARY KEY,
    channelName VARCHAR(255) NOT NULL,
    channelTopic VARCHAR(255),
    ChannelOwnerId INTEGER REFERENCES users(userId) ON DELETE SET NULL,
    isPublic BOOLEAN NOT NULL DEFAULT TRUE,
    photoURL VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create subChannels table
CREATE TABLE subChannels (
    subChannelId SERIAL PRIMARY KEY,
    channelId INTEGER REFERENCES channels(channelId) ON DELETE CASCADE,
    subChannelName VARCHAR(255) NOT NULL,
    subChannelTopic VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create invitation table
CREATE TABLE invitation (
    invitationid SERIAL PRIMARY KEY,
    inviteduserid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    invitinguserid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    invitationstatus VARCHAR(255),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
    messageId SERIAL PRIMARY KEY,
    ChannelId INTEGER REFERENCES channels(channelId) ON DELETE CASCADE,
    subChannelId INTEGER REFERENCES subChannels(subChannelId) ON DELETE CASCADE,
    fileName VARCHAR(255),
    fileSize INTEGER,
    fileType VARCHAR(255),
    fileURL VARCHAR(255),
    mediaHeight INTEGER,
    mediaWidth INTEGER,
    userId INTEGER REFERENCES users(userId) ON DELETE SET NULL,
    text TEXT,
    type VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create userChannelJoin table
CREATE TABLE userChannelJoin (
    channelId INTEGER REFERENCES channels(channelId) ON DELETE CASCADE,
    userId INTEGER REFERENCES users(userId) ON DELETE CASCADE,
    PRIMARY KEY (channelId, userId)
);

-- Create userSubChannelJoin table
CREATE TABLE userSubChannelJoin (
    subChannelId INTEGER REFERENCES subChannels(subChannelId) ON DELETE CASCADE,
    userId INTEGER REFERENCES users(userId) ON DELETE CASCADE,
    PRIMARY KEY (subChannelId, userId)
);

-- Create UserSubChannelMessageLink table
CREATE TABLE UserSubChannelMessageLink (
    userId INTEGER REFERENCES users(userId) ON DELETE CASCADE,
    subChannelId INTEGER REFERENCES subChannels(subChannelId) ON DELETE CASCADE,
    messageId INTEGER REFERENCES messages(messageId) ON DELETE CASCADE,
    PRIMARY KEY (userId, subChannelId, messageId)
);


-- Insert faculties
INSERT INTO faculty (facultyName) VALUES
('Sağlık Bilimleri Enstitüsü'),
('Sosyal Bilimler Enstitüsü'),
('Adalet Meslek Yüksekokulu'),
('Sağlık Hizmetleri Meslek Yüksekokulu'),
('Meslek Yüksekokulu'),
('Diş Hekimliği Fakültesi'),
('Eczacılık Fakültesi'),
('Güzel Sanatlar, Tasarım ve Mimarlık Fakültesi'),
('Hukuk Fakültesi'),
('İktisadi, İdari ve Sosyal Bilimler Fakültesi'),
('İletişim Fakültesi'),
('Sağlık Bilimleri Fakültesi'),
('Mühendislik ve Doğa Bilimleri Fakültesi'),
('Siyasal Bilgiler Fakültesi'),
('Tıp Fakültesi');

-- Insert departments
INSERT INTO department (departmentName, facultyId) VALUES
('Beslenme ve Diyetetik', 1),
('Klinik Psikoloji', 2),
('Adalet', 3),
('Ağız ve Diş Sağlığı', 4),
('Ameliyathane Hizmetleri', 4),
('Anestezi', 4),
('Biyomedikal Cihaz Teknolojisi', 4),
('Diş Protez Teknolojisi', 4),
('Diyaliz', 4),
('Fizyoterapi', 4),
('İlk ve Acil Yardım', 4),
('Odyometri', 4),
('Optisyenlik', 4),
('Radyoterapi', 4),
('Sağlık Turizmi İşletmeciliği', 4),
('Tıbbi Görüntüleme Teknikleri', 4),
('Tıbbi Laboratuvar Teknikleri', 4),
('Bilgisayar Programcılığı', 5),
('İç Mekan Tasarımı', 5),
('İnşaat Teknolojisi', 5),
('Pazarlama ve Reklamcılık', 5),
('Diş Hekimliği (Türkçe)', 6),
('Diş Hekimliği (İngilizce)', 6),
('Eczacılık (Türkçe)', 7),
('Eczacılık (İngilizce)', 7),
('Gastronomi ve Mutfak Sanatları (İngilizce)', 8),
('İç Mimarlık ve Çevre Tasarımı', 8),
('Hukuk', 9),
('Psikoloji (Türkçe)', 10),
('Psikoloji (İngilizce)', 10),
('Uluslararası Ticaret ve Finansman (Türkçe)', 10),
('Uluslararası Ticaret ve Finansman (İngilizce)', 10),
('Yönetim Bilişim Sistemleri', 10),
('Halkla İlişkiler ve Reklamcılık', 11),
('Beslenme ve Diyetetik', 12),
('Dil ve Konuşma Terapisi', 12),
('Ebelik', 12),
('Ergoterapi', 12),
('Fizyoterapi ve Rehabilitasyon', 12),
('Hemşirelik (Türkçe)', 12),
('Hemşirelik (İngilizce)', 12),
('Odyoloji', 12),
('Bilgisayar Mühendisliği (İngilizce)', 13),
('Elektrik-Elektronik Mühendisliği (İngilizce)', 13),
('Siyaset Bilimi ve Uluslararası İlişkiler (İngilizce)', 14),
('Tıp (Türkçe)', 15),
('Tıp (İngilizce)', 15);