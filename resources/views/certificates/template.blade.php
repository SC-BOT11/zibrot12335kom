<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat - {{ $event->title }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .certificate-container {
            width: 90%;
            height: 80%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }
        
        .certificate-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .certificate-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            opacity: 0.3;
        }
        
        .certificate-title {
            font-size: 2.5em;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .certificate-subtitle {
            font-size: 1.2em;
            margin: 10px 0 0 0;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .certificate-body {
            padding: 50px;
            text-align: center;
            position: relative;
        }
        
        .certificate-text {
            font-size: 1.8em;
            color: #333;
            margin: 30px 0;
            line-height: 1.6;
        }
        
        .participant-name {
            font-size: 2.2em;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
            text-decoration: underline;
            text-decoration-color: #764ba2;
            text-decoration-thickness: 3px;
        }
        
        .event-details {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #667eea;
        }
        
        .event-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }
        
        .event-info {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
        }
        
        .event-info-item {
            text-align: center;
        }
        
        .event-info-label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        
        .event-info-value {
            font-size: 1.1em;
            font-weight: bold;
            color: #333;
        }
        
        .certificate-footer {
            position: absolute;
            bottom: 30px;
            left: 50px;
            right: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .certificate-number {
            font-size: 0.9em;
            color: #666;
            font-family: monospace;
        }
        
        .certificate-date {
            font-size: 0.9em;
            color: #666;
        }
        
        .decorative-elements {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
        }
        
        .corner-decoration {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid #667eea;
        }
        
        .corner-decoration.top-left {
            top: 20px;
            left: 20px;
            border-right: none;
            border-bottom: none;
        }
        
        .corner-decoration.top-right {
            top: 20px;
            right: 20px;
            border-left: none;
            border-bottom: none;
        }
        
        .corner-decoration.bottom-left {
            bottom: 20px;
            left: 20px;
            border-right: none;
            border-top: none;
        }
        
        .corner-decoration.bottom-right {
            bottom: 20px;
            right: 20px;
            border-left: none;
            border-top: none;
        }
        
        .seal {
            position: absolute;
            top: 50%;
            right: 50px;
            transform: translateY(-50%);
            width: 80px;
            height: 80px;
            border: 3px solid #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(102, 126, 234, 0.1);
        }
        
        .seal-text {
            font-size: 0.7em;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            line-height: 1.2;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <!-- Decorative Elements -->
        <div class="decorative-elements">
            <div class="corner-decoration top-left"></div>
            <div class="corner-decoration top-right"></div>
            <div class="corner-decoration bottom-left"></div>
            <div class="corner-decoration bottom-right"></div>
        </div>
        
        <!-- Certificate Header -->
        <div class="certificate-header">
            <h1 class="certificate-title">SERTIFIKAT</h1>
            <p class="certificate-subtitle">Certificate of Participation</p>
        </div>
        
        <!-- Certificate Body -->
        <div class="certificate-body">
            <p class="certificate-text">
                Dengan bangga kami menyatakan bahwa
            </p>
            
            <div class="participant-name">
                {{ $participant->name }}
            </div>
            
            <p class="certificate-text">
                telah berpartisipasi dengan baik dalam kegiatan
            </p>
            
            <div class="event-details">
                <div class="event-title">{{ $event->title }}</div>
                <div class="event-info">
                    <div class="event-info-item">
                        <div class="event-info-label">Tanggal</div>
                        <div class="event-info-value">{{ \Carbon\Carbon::parse($event->date)->format('d M Y') }}</div>
                    </div>
                    <div class="event-info-item">
                        <div class="event-info-label">Lokasi</div>
                        <div class="event-info-value">{{ $event->location }}</div>
                    </div>
                    <div class="event-info-item">
                        <div class="event-info-label">Waktu</div>
                        <div class="event-info-value">{{ $event->start_time }} - {{ $event->end_time }}</div>
                    </div>
                </div>
            </div>
            
            <p class="certificate-text">
                Sertifikat ini diberikan sebagai bukti keikutsertaan dan diharapkan dapat menjadi motivasi untuk terus berkarya dan berprestasi.
            </p>
        </div>
        
        <!-- Certificate Footer -->
        <div class="certificate-footer">
            <div class="certificate-number">
                No. Sertifikat: {{ $certificateNumber }}
            </div>
            <div class="certificate-date">
                {{ \Carbon\Carbon::now()->format('d M Y') }}
            </div>
        </div>
        
        <!-- Seal -->
        <div class="seal">
            <div class="seal-text">
                EVENTHUB<br>
                OFFICIAL
            </div>
        </div>
    </div>
</body>
</html>
