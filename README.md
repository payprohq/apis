# PayPRO - Android ПОС холболт

[TOC]

## 1. Танилцуулга

Тус гарын авлага нь `Андройд` аппликейшнээс `PayPRO` төлбөрийн аппликэйшнтай холболт хийх талаар зааварчилгааг агуулсан болно.

## 1.1. Sequence Diagram

```seq
Client app->Payment app: Гүйлгээний хүсэлт\n
Note right of Payment app: Төлбөр төлөлт\nхийгдэнэ
Payment app->Client app: Гүйлгээний хариу
```

[==============]

## 1.2. Жишээ код

[Жишээ код (Java) - Татах](/apis/files/payprodemojava.zip)
[Жишээ код (Kotlin) - Татах](/apis/files/paypro-demo.zip)

[==============]

## 1.3. PayPRO SDK тохируулах

build.gradle файл дээр доорх байдлаар нэмж, sync хийх

```
implementation 'mn.lambda:paypro-sdk:1.0.49'
```

## 1.4. SDK функцуудтай ажиллах

PayProApi class нь SDK функцуудыг агуулсан байна.

### 1.4.1. SDK функцыг дуудаж ашиглах

```
class PayProApi {
    ...
    fun doSomething( // функцын нэр
        context: Context,
        callback: (PayProResponse<T>) -> Unit // хариу хүлээж авах callback
    )
    ...
}
```

### 1.4.2. Хүсэлтийн хариуг хүлээж авах

Callback функцын үрд дүнд ирж байгаа хариуг Амжилттай болон Амжилтгүй биелсэн эсэхийг дараах байдлаар шалгаж боловсруулна

```
api.doSomething(context) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            println(it.data)
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

## 1.5. Гүйлгээ хийх

Гүйлгээ хийх функц.

```
class PayProApi {
    ...
    fun payment(
        context: Context,
        amount: Double, // Гүйлгээний дүн
        options: PaymentOptions,
        callback: (PayProResponse<PaymentResult>) -> Unit // Гүйлгээний хариу хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.5.1. Гүйлгээ хийхэд шаардлагатай параметрүүд

| Параметр | Төрөл          | Тайлбар                     |
| -------- | -------------- | --------------------------- |
| amount   | double         | Гүйлгээ хийх дүн            |
| options  | PaymentOptions | Гүйлгээ хийх options утгууд |

`PaymentOptions` class нь дараах бүтэцтэй байна

```
class PaymentOptions(
    val payment: Int, // Төлбөрийн хэрэгслийн төрөл,
    val skipPrint: Boolean // Баримт хэвлэх эсэх
)
```

### 1.5.2. Төлбөрийн хэрэгслийн утга

| Утга | Төрөл                        | Тайлбар                                                         |
| ---- | ---------------------------- | --------------------------------------------------------------- |
| 0    | Төлбөрийн хэрэгсэл сонгоогүй | Боломжит бүх төлбөрийн хэрэгслийн сонголтууд пос дээр гарч ирнэ |
| 1    | Карт                         | Зөвхөн картын гүйлгээ хийх үед                                  |
| 3    | SocialPay                    | Зөвхөн SocialPay - QR код ашиглан гүйлгээ хийх үед              |
| 4    | Monpay                       | Зөвхөн Monpay - QR код ашиглан гүйлгээ хийх үед                 |

[==============]

### 1.5.3. Гүйлгээний хариу - Амжилттай

Гүйлгээ амжилттай болсон үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба гүйлгээний мэдээллийг `data` талбараас авна.

```
api.payment(context, amount, options) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // PaymentResult төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`PaymentResult` class нь дараах бүтэцтэй байна

```
class PaymentResult(
    val merchantId: String, // Мерчант дугаар
    val terminalId: String, // Терминал дугаар
    val amount: Double, // Гүйлгээ хийсэн дүн
    val traceno: String, // Гүйлгээний trace дугаар
    val batchno: String, // Гүйлгээний batch дугаар
    val maskedPAN: String, // Картын маскалсан дугаар
    val systemRef: String, // System ref дугаар
    val approveCode: String, // Зөвшөөрлийн код
    val date: String, // Гүйлгээ хийгдсэн огноо
    val payment: Int, // Гүйлгээний төрөл
    val paymentLabel: String // Гүйлгээний төрөл текст утга
)
```

### 1.5.4. Гүйлгээний хариу - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.cardPayment(context, amount) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.6. Гүйлгээ буцаах

---

[==============]

## 1.7. Өндөрлөгөө хийх

Өндөрлөгөө хийх функц.

```
class PayProApi {
    ...
    fun settlementStart(
        context: Context,
        callback: (PayProResponse<SettlementResult>) -> Unit // Өндөрлөгөөний хариу хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.7.1. Өндөрлөгөөний хариу - Амжилттай

Өндөрлөгөө амжилттай болсон үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба өндөрлөгөө мэдээллийг `data` талбараас авна.

```
api.settlementStart(context, amount, options) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // SettlementResult төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`SettlementResult` class нь дараах бүтэцтэй байна

```
class SettlementResult(
    val merchantId: String, // Мерчант дугаар
    val terminalId: String, // Терминал дугаар
    val amount: Double, // Гүйлгээ хийсэн дүн
    val count: Int, // Гүйлгээний тоо
    val settlementAmount: Double?, // Дансанд орох дүн
    val date: String, // Гүйлгээ хийгдсэн огноо
    val no: Int, // Нэгтгэл дугаар
)
```

### 1.7.2. Гүйлгээний хариу - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.settlementStart(context, amount) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.8. Гүйлгээний жагсаалт

Гүйлгээний жагсаалт харах функц.

```
class PayProApi {
    ...
    fun transactionList(
        context: Context,
        callback: (PayProResponse<Empty>) -> Unit
    )
    ...
}
```

[==============]

## 1.9. Баримт хэвлэх

POS төхөөрөмж дээр баримт хэвлэх үед ашиглана. Баримт хэвлэх талаар дэлгэрэнгүй жишээг Демо кодноос харна уу.

```
class PayProApi {
    ...
    fun print(
        context: Context,
        payload: String, // Баримтын хэвлэх дата
        callback: (PayProResponse<Empty>) -> Unit // Хэвлэх үйлдлийн хариуг хүлээж авах callback
    )
    ...
}
```

### 1.9.1. Баримт хэвлэхэд шаардлагатай параметрүүд

| Параметр | Төрөл  | Тайлбар                                                                     |
| -------- | ------ | --------------------------------------------------------------------------- |
| payload  | string | Хэвлэх мэдээллийг `json` форматтайгаар дамжуулна, жишээ кодтой танилцана уу |

### 1.9.2. Баримт Амжилттай хэвлэгдэх

Баримт амжилттай хэвлэгдсэн үед `PayProResponse.Success` төрөлтэй хариу ирнэ.

```
api.print(context, payload) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
        }
        is PayProResponse.Error -> {
        }
    }
}
```

### 1.9.3. Баримт хэвлэлт амжилтгүй болох

Баримтын цаас дууссан эсвэл бусад тохиолдолд `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.print(context, payload) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.10. Баримт хэвлэх (With PayPRO UI)

---

[==============]

## 1.11. ПОС Төхөөрөмжийн мэдээлэл авах

Пос төхөөрөмжийн мэдээлэл авах

```
class PayProApi {
    ...
    fun getDeviceInfo(
        context: Context,
        callback: (PayProResponse<DeviceInfo>) -> Unit // Төхөөрөмжийн мэдээлэл хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.11.1. Төхөөрөмжийн мэдээлэл - Амжилттай

Төхөөрөмжийн мэдээлэл амжилттай авсан үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба төхөөрөмжийн мэдээллийг `data` талбараас авна.

```
api.getDeviceInfo(context) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // DeviceInfo төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`DeviceInfo` class нь дараа бүтэцтэй байна

```
class DeviceInfo(
    val serialNumber: String, // Төхөөрөмжийн Сериал дугаар
)
```

### 1.11.2. Төхөөрөмжийн мэдээлэл - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.getDeviceInfo(context) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

## 1.12. NFC картын сериал дугаар авах

NFC картын сериал дугаар авах үед дараах функцыг дуудна

```
class PayProApi {
    ...
    fun readCardUID(
        context: Context,
        timeout: Int,
        callback: (PayProResponse<NFCCard>) -> Unit // NFC картын мэдээлэл хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.12.1. NFC карт - Амжилттай

NFC карт амжилттай уншигдсан үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба картын мэдээллийг `data` талбараас авна.

```
api.readCardUID(context, timeout) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // NFCCard төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`NFCCard` class нь дараа бүтэцтэй байна

```
class NFCCard(
    val uid: String, // Картын UID
)
```

### 1.12.2. NFC карт - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.readCardUID(context) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.13. Туузан картын мэдээлэл авах

Туузан картын мэдээлэл авах үед дараах функцыг дуудна

```
class PayProApi {
    ...
    fun readMagCard(
        context: Context,
        timeout: Int,
        callback: (PayProResponse<MagCard>) -> Unit // NFC картын мэдээлэл хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.13.1. Туузан карт - Амжилттай

Туузан карт амжилттай уншигдсан үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба картын мэдээллийг `data` талбараас авна.

```
api.readMagCard(context, timeout) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // MagCard төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`MagCard` class нь дараа бүтэцтэй байна

```
class MagCard(
    val track1: String, // track1
    val track2: String, // track2
    val track3: String, // track3
)
```

### 1.13.2. Туузан карт - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.readMagCard(context) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]

## 1.14. Иргэний үнэмлэхийн мэдээлэл унших

Иргэний үнэмлэхийн мэдээлэл унших үед дараах функцыг дуудна

```
class PayProApi {
    ...
    fun readIDCard(
        context: Context,
        timeout: Int,
        callback: (PayProResponse<IDCard>) -> Unit // Иргэний үнэмлэхийн мэдээлэл хүлээж авах callback
    )
    ...
}
```

[==============]

### 1.14.1. Иргэний үнэмлэхийн мэдээлэл - Амжилттай

Иргэний үнэмлэхийн мэдээлэл амжилттай уншигдсан үед `PayProResponse.Success` төрөлтэй хариу ирэх байх ба Иргэний үнэмлэхийн мэдээллийг `data` талбараас авна.

```
api.readIDCard(context, timeout) {
    when(it) {
        is PayProResponse.Success -> {
            // Амжилттай
            val data = it.data // IDCard төрөлтэй байна
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
        }
    }
}

```

`IDCard` class нь дараа бүтэцтэй байна

```
class IDCard(
    var givenName: String? = null
    var registrationNumber: String? = null
    var dateOfBirth: String? = null
    var sex: String? = null
    var surname: String? = null
    var familyName: String? = null
    var dateOfExpiry: String? = null
    var dateOfIssue: String? = null
    var issuingAuthority: String? = null
    var birthPlace: String? = null
    var civilID: String? = null
    var idCardNum: String? = null
    var address: String? = null
)
```

### 1.14.2. Иргэний үнэмлэхийн мэдээлэл - Амжилтгүй

Амжилтгүй болсон үед `PayProResponse.Error` төрөлтэй хариу ирнэ. Шалтгааныг `message` талбараас авна.

```
api.readIDCard(context) {
    when(it) {
        is PayProResponse.Success -> {
        }
        is PayProResponse.Error -> {
            // Амжилтгүй
            println("алдаа: ${it.message}")
        }
    }
}
```

[==============]
