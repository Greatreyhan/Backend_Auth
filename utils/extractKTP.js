export function cleanText(text) {
    // Preprocessing teks untuk menghilangkan simbol atau karakter yang tidak diinginkan
    return text
        .replace(/[^a-zA-Z0-9\s,:./-]/g, '') // Menghilangkan karakter yang tidak diinginkan
        .replace(/\s+/g, ' ') // Menghapus spasi berlebih
        .trim();
}

export function extractKTPData(text) {
    const data = {};

    // Fungsi membersihkan teks
    const cleanedText = cleanText(text); // Panggil fungsi cleanText


    // Ekstrak NIK (mengantisipasi spasi di antara angka)
    const nikMatch = cleanedText.match(/nik\s*:\s*([\d\s]{16})/i);
    if (nikMatch && nikMatch[1]) {
        // Ambil hanya angka dengan menghilangkan semua spasi dari hasil
        const nikNum = nikMatch[1].replace(/\D/g, ''); // Menghilangkan semua karakter non-digit
        data.nik = nikNum.length === 16 ? nikNum : null; // Pastikan panjang NIK adalah 16 digit
    } else {
        data.nik = null; // Jika NIK tidak ditemukan
    }

    // Ekstrak Nama (menangani masalah penyatuan dengan tempat lahir)
    const namaMatch = cleanedText.match(/Nama\s*:\s*([A-Z\s]+)/);
    data.nama = namaMatch ? namaMatch[1].trim() : null;

    // Ekstrak Tempat dan Tanggal Lahir
    const ttlMatch = cleanedText.match(/(?:tempat|tgl|lahir|\b\d{2}[-\/.]\d{2}[-\/.]\d{4}\b).*/gi);
    if (ttlMatch && ttlMatch.length > 0) {
        const kotaLahirMatch = ttlMatch[0].match(/:\s*([^\s,]+)/gi);
        if (kotaLahirMatch && kotaLahirMatch.length > 0) {
            const kotaLahir = kotaLahirMatch[0].split(' ');
            data.tempat_lahir = kotaLahir[1] ? kotaLahir[1] : null;
        }

        const dateMatch = ttlMatch[0].match(/\b\d{2}[-\/.]\d{2}[-\/.]\d{4}\b/);
        data.tanggal_lahir = dateMatch ? dateMatch[0] : null;
    } else {
        data.tempat_lahir = null;
        data.tanggal_lahir = null;
    }

    // Ekstrak Jenis Kelamin dan Golongan Darah 
    const laki = cleanedText.match(/\b(laki|laki-laki)\b/gim);
    const perempuan = cleanedText.match(/\b(perempuan|permpuan|perempaun)\b/gi);
    data.jenis_kelamin = laki ? 'LAKI-LAKI' : perempuan ? 'PEREMPUAN' : null;

    const golonganDarahMatch = cleanedText.match(/Gol\.?\s*Darah\s*:\s*([A-Z-]*)/i);
    data.golongan_darah = golonganDarahMatch ? golonganDarahMatch[1] : '-';

    // Ekstrak Alamat
    const alamatMatch = text.match(/^.*alamat.*/gim);
    console.log(alamatMatch)
    if (alamatMatch && alamatMatch.length > 0) {
        const extractedAlamat = alamatMatch[0]?.trim().split(' ').slice(2).join(' ');
        data.alamat = extractedAlamat ? extractedAlamat : null;
    } else {
        data.alamat = null;
    }

    // Ekstrak RT/RW (menangani spasi dan tanda hubung tidak rapi)
    const rtRwMatch = text.match(/^.*(?:\brt\b|\brw\b|\brt\/rw\b|\d{3}\/\d{3}).*$/gim);
    if (rtRwMatch && rtRwMatch.length > 0) {
        const rtrwextracted = rtRwMatch[0].match(/\d{3}\/\d{3}/);
        if (rtrwextracted && rtrwextracted.length > 0) {
            const rtrw = rtrwextracted[0].split('/');
            data.rt = rtrw[0] ? rtrw[0] : null;
            data.rw = rtrw[1] ? rtrw[1] : null;
        }
    } else {
        data.rt = null;
        data.rw = null;
    }

    // Ekstrak Kelurahan/Desa
    const kelDesaMatch = text.match(/^.*(?:Kel.Desa|Desa).*$/gim);
    if (kelDesaMatch && kelDesaMatch.length > 0) {
        const extracted_kel = kelDesaMatch[0]?.split(' ').slice(-2);
        const kel_des = extracted_kel.reduce((longest, current) => {
            return current.length > longest.length ? current : longest;
        }, '');
        data.kelurahan = kel_des ? kel_des.trim() : null;
    } else {
        data.kelurahan = null;
    }

    // Ekstrak Kecamatan 
    const kecamatanMatch = text.match(/Kecamatan\s*:\s*([A-Z\s]+)/i);
    if (kecamatanMatch && kecamatanMatch.length > 0) {
        if (kecamatanMatch) {
            data.kecamatan = kecamatanMatch[1] ? kecamatanMatch[1].trim() : null;
        } else {
            const extracted_kec = kecamatanMatch[0]?.split(' ')[1]?.match(/:(.*)/);
            data.kecamatan = extracted_kec && extracted_kec[1] ? extracted_kec[1].trim() : null;
        }
    } else {
        data.kecamatan = null;
    }

    // Ekstrak Agama
    const agamaMatch = cleanedText.match(/Agama\s*:\s*([A-Z]+)/i);
    if (!agamaMatch) {
        const agamaMapping = {
            islam: 'ISLAM',
            protestan: 'PROTESTAN',
            Katolik: 'KATOLIK',
            Budha: 'BUDHA',
            Hindu: 'HINDU',
            Khonghucu: 'KONGHUCU'
        };

        for (const [key, value] of Object.entries(agamaMapping)) {
            if (cleanedText.match(new RegExp(`\\b${key}\\b`, 'gi'))) {
                data.agama = value;
                break;
            }
        }
        if (!data.agama) data.agama = null;
    } else {
        data.agama = agamaMatch[1].trim();
    }

    // Ekstrak Status Perkawinan
    const statusMatch = text.match(/^.*\b(?:status|perkawinan)\b.*$/gim);
    const statusMap = {
        'kawin': 'KAWIN',
        'belum': 'BELUM KAWIN',
        'hidup': 'CERAI HIDUP',
        'mati': 'CERAI MATI'
    };
    const getStatus = (string, statusMap) => {
        const lowerCaseString = string.toLowerCase();
        for (const [keyword, status] of Object.entries(statusMap)) {
            if (lowerCaseString.includes(keyword)) {
                return status;
            }
        }
        return null;
    };
    const data_status = getStatus(statusMatch[0].split(' ').slice(-2).join(' '), statusMap);
    data.status_perkawinan = data_status;
    if (data_status == null && statusMatch && statusMatch.length > 0) {
        const extractedstatus = statusMatch[0]?.trim().split(' ').slice(2, 4).join(' ');
        data.status_perkawinan = extractedstatus ? extractedstatus.trim() : null;
    }

    // Ekstrak Pekerjaan
    const pekerjaanMatch = text.match(/Pekerjaan\s*:\s*([A-Z\s]+)(?=\n)/i);
    if (pekerjaanMatch[1].split(' ')) {
        const pekerjaan_fix = pekerjaanMatch[1].split(' ').reduce((longest, current) => {
            return current.length > longest.length ? current : longest;
        }, '');
        data.pekerjaan = pekerjaan_fix ? pekerjaan_fix.trim() : null;
    }
    else {
        data.pekerjaan = pekerjaanMatch ? pekerjaanMatch[1].replace(/[^A-Z\s]/gi, '').trim() : null;
    }

    // Ekstrak Kewarganegaraan
    const kewarganegaraanMatch = cleanedText.match(/Kewarganegaraan\s*:\s*(WNI|WNA)/i);
    data.kewarganegaraan = kewarganegaraanMatch ? kewarganegaraanMatch[1] : null;

    // console.log(data)
    return { data, cleanedText };
}

