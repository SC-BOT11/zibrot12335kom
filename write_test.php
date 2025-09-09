<?php
// Nama file untuk menulis output
$outputFile = __DIR__ . '/output_result.txt';

// Fungsi untuk menulis ke file
function writeToFile($file, $text) {
    file_put_contents($file, $text . "\n", FILE_APPEND);
}

// Hapus file output jika sudah ada
if (file_exists($outputFile)) {
    unlink($outputFile);
}

// Tulis informasi dasar
writeToFile($outputFile, "=== PHP Test Output ===");
writeToFile($outputFile, "PHP Version: " . PHP_VERSION);
writeToFile($outputFile, "Current Directory: " . __DIR__);

// Coba tulis ke file
$testFile = __DIR__ . '/test_file.txt';
if (file_put_contents($testFile, 'test') !== false) {
    writeToFile($outputFile, "✅ Berhasil menulis ke file: " . realpath($testFile));
    writeToFile($outputFile, "  Ukuran file: " . filesize($testFile) . " bytes");
    unlink($testFile);
} else {
    writeToFile($outputFile, "❌ Gagal menulis ke file");
}

// Cek direktori database
$dbDir = __DIR__ . '/database';
writeToFile($outputFile, "\n=== Database Directory ===");
if (is_dir($dbDir)) {
    writeToFile($outputFile, "✅ Direktori database ada");
    
    // Coba buat file di direktori database
    $testDbFile = $dbDir . '/test_db_file.txt';
    if (file_put_contents($testDbFile, 'test') !== false) {
        writeToFile($outputFile, "✅ Berhasil menulis ke direktori database");
        unlink($testDbFile);
    } else {
        writeToFile($outputFile, "❌ Gagal menulis ke direktori database");
    }
} else {
    writeToFile($outputFile, "❌ Direktori database tidak ditemukan");
}

// Beri tahu pengguna
if (file_exists($outputFile)) {
    echo "Output telah ditulis ke: " . realpath($outputFile) . "\n";
} else {
    echo "Gagal menulis output ke file. Periksa izin direktori.\n";
}
